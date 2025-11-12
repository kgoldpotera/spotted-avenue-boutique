import { HeroSlider } from '@/components/HeroSlider';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import concertAd from '@/assets/concert-ad.jpeg';

const Home = () => {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_featured', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: saleProducts } = useQuery({
    queryKey: ['sale-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .not('original_price', 'is', null)
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <HeroSlider />

        {/* Designer Outlet Banner */}
        <section className="mt-8">
          <div className="bg-primary text-primary-foreground rounded-lg py-6 px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Designer Outlet
            </h2>
          </div>
        </section>

        {/* Concert Ad Banner */}
        <section className="mt-8">
          <a 
            href="https://thechampionshipstadiumconcerts.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img 
              src={concertAd} 
              alt="The Championship Stadium Concerts by SitaAlexandra" 
              className="w-full h-auto"
            />
          </a>
        </section>

        {featuredProducts && featuredProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-primary">Featured Products</h2>
              <Link to="/products/all">
                <Button variant="secondary">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  imageUrl={product.image_url}
                  categoryName={product.categories?.name}
                />
              ))}
            </div>
          </section>
        )}

        {saleProducts && saleProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-destructive">On Sale Now</h2>
              <Link to="/products/sale">
                <Button variant="destructive">View All Sales</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  imageUrl={product.image_url}
                  categoryName={product.categories?.name}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 bg-secondary text-secondary-foreground rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Discover Luxury Shopping</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Explore our curated collection of premium bags, designer clothes, luxury shoes, and exclusive accessories.
          </p>
          <Link to="/products/all">
            <Button size="lg" variant="default">
              Shop All Products
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;
