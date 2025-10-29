import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Navbar = () => {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();

  const { data: cartCount } = useQuery({
    queryKey: ['cart-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);
      
      if (error) return 0;
      return data.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user,
  });

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            DesignerCollections
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/products/bags" className="hover:text-primary transition-colors">
              Bags
            </Link>
            <Link to="/products/clothes" className="hover:text-primary transition-colors">
              Clothes
            </Link>
            <Link to="/products/shoes" className="hover:text-primary transition-colors">
              Shoes
            </Link>
            <Link to="/products/accessories" className="hover:text-primary transition-colors">
              Accessories
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {(isAdmin || isSuperAdmin) && (
                  <Link to={isSuperAdmin ? "/super-admin" : "/admin"}>
                    <Button variant="secondary" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
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
