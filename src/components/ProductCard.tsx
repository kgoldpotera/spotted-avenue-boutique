import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName?: string;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  originalPrice, 
  imageUrl, 
  categoryName 
}: ProductCardProps) => {
  const isOnSale = originalPrice && originalPrice > price;
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate('/auth');
        throw new Error('Please sign in to add items to cart');
      }
      
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: id, quantity: 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast.success('Added to cart!');
    },
    onError: (error: any) => {
      if (error.message !== 'Please sign in to add items to cart') {
        toast.error(error.message || 'Failed to add to cart');
      }
    },
  });

  return (
    <Card className="overflow-hidden hover-scale group">
      <Link to={`/product/${id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isOnSale && (
            <Badge className="absolute top-2 right-2 bg-destructive">
              Sale
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        {categoryName && (
          <p className="text-xs text-muted-foreground mb-1">{categoryName}</p>
        )}
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">GBP{price.toFixed(2)}</span>
          {isOnSale && (
            <span className="text-sm line-through text-muted-foreground">
              GBP{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          variant="default"
          onClick={(e) => {
            e.preventDefault();
            addToCartMutation.mutate();
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
