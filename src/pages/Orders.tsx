import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your order has been confirmed. Check your email for details.",
      });
      // Clean URL
      navigate("/orders", { replace: true });
    }
  }, [searchParams, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (name, price, image_url)
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !loading && !!user,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Items</p>
                    <div className="space-y-2">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-muted p-3 rounded">
                          <div className="flex items-center gap-3">
                            {item.products.image_url && (
                              <img
                                src={item.products.image_url}
                                alt={item.products.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.products.name}</p>
                              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">${parseFloat(String(item.price_at_purchase)).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="font-medium">Total</p>
                    <p className="text-lg font-bold">${Number(order.total).toFixed(2)}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {order.status === "pending" && "Your order is being prepared"}
                    {order.status === "processing" && "Your order is being processed"}
                    {order.status === "shipped" && "Your order has been shipped"}
                    {order.status === "delivered" && "Your order has been delivered"}
                    {order.status === "cancelled" && "This order was cancelled"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                <button
                  onClick={() => navigate("/")}
                  className="text-primary hover:underline"
                >
                  Start Shopping
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;
