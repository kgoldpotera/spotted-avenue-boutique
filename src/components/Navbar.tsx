import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const Navbar = () => {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cartCount } = useQuery({
    queryKey: ["cart-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);

      if (error) return 0;
      return data.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user,
  });

  const { data: mainCategories } = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            Designer Collective
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {mainCategories?.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-6 mt-8">
                  {mainCategories?.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products/${category.slug}`}
                      className="text-lg hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}

                  {user && (isAdmin || isSuperAdmin) && (
                    <>
                      <Link
                        to={isSuperAdmin ? "/super-admin" : "/admin"}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {isSuperAdmin ? "Super Admin" : "Admin"}
                        </Button>
                      </Link>

                      <Link
                        to="/order-management"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Orders
                        </Button>
                      </Link>
                    </>
                  )}

                  {user && !isAdmin && !isSuperAdmin && (
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        My Orders
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {user ? (
              <>
                {(isAdmin || isSuperAdmin) && (
                  <>
                    <Link
                      to={isSuperAdmin ? "/super-admin" : "/admin"}
                      className="hidden md:block"
                    >
                      <Button variant="secondary" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {isSuperAdmin ? "Super Admin" : "Admin"}
                      </Button>
                    </Link>

                    <Link to="/order-management" className="hidden md:block">
                      <Button variant="ghost" size="sm">
                        Orders
                      </Button>
                    </Link>
                  </>
                )}

                {user && !isAdmin && !isSuperAdmin && (
                  <Link to="/orders" className="hidden md:block">
                    <Button variant="ghost" size="sm">
                      My Orders
                    </Button>
                  </Link>
                )}

                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount && cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
