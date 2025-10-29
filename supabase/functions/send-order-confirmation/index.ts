import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order } = await req.json();
    
    console.log("Sending order confirmation for order:", order.id);

    // Build order items HTML
    const orderItemsHtml = order.order_items
      .map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.products.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.price_at_purchase).toFixed(2)}</td>
        </tr>
      `)
      .join("");

    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Dear ${order.customer_name},</p>
        <p>Thank you for your order! Your payment has been confirmed.</p>
        
        <h2 style="color: #555; margin-top: 30px;">Order Details</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">$${parseFloat(order.total).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with DesignerCollections!</p>
      </div>
    `;

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Order Received</h1>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
        <p><strong>Total:</strong> $${parseFloat(order.total).toFixed(2)}</p>
        
        <h2 style="color: #555; margin-top: 20px;">Items:</h2>
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
        </table>
        
        ${order.shipping_address ? `
          <h2 style="color: #555; margin-top: 20px;">Shipping Address:</h2>
          <p>${JSON.stringify(order.shipping_address, null, 2)}</p>
        ` : ''}
      </div>
    `;

    // Send to customer
    await resend.emails.send({
      from: "DesignerCollections <onboarding@resend.dev>",
      to: [order.customer_email],
      subject: "Order Confirmation - DesignerCollections",
      html: customerEmailHtml,
    });

    // Send to admin
    await resend.emails.send({
      from: "DesignerCollections <onboarding@resend.dev>",
      to: ["koechmanoah32@gmail.com"],
      subject: `New Order #${order.id.slice(0, 8)}`,
      html: adminEmailHtml,
    });

    console.log("Confirmation emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
