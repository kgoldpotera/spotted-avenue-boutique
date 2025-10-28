import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

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
          <span className="text-xl font-bold text-primary">€{price.toFixed(2)}</span>
          {isOnSale && (
            <span className="text-sm line-through text-muted-foreground">
              €{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="default">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
