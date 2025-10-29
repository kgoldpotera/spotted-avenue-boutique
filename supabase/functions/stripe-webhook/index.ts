import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log("Webhook event type:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const paymentIntentId = session.payment_intent as string;

    console.log("Processing completed checkout:", { orderId, paymentIntentId });

    if (orderId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
      }

      // Get order details for email
      const { data: order } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, price))")
        .eq("id", orderId)
        .single();

      // Clear user's cart
      if (order) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", order.user_id);

        // Send confirmation email
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ order }),
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
        }
      }

      console.log("Order updated successfully:", orderId);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
