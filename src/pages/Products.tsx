import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const Products = () => {
  const { category } = useParams<{ category?: string }>();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            parent_id
          )
        `);

      // Handle special categories
      if (category === "sale") {
        query = query.not("original_price", "is", null);
      } else if (category && category !== "all") {
        // First, find the category by slug
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id, parent_id")
          .eq("slug", category)
          .single();

        if (categoryData) {
          // If it's a main category (parent_id is null), get all products from its subcategories
          if (!categoryData.parent_id) {
            const { data: subcategories } = await supabase
              .from("categories")
              .select("id")
              .eq("parent_id", categoryData.id);

            if (subcategories && subcategories.length > 0) {
              const subcategoryIds = subcategories.map(sub => sub.id);
              query = query.in("category_id", subcategoryIds);
            }
          } else {
            // If it's a subcategory, filter by that specific category
            query = query.eq("category_id", categoryData.id);
          }
        }
      }
      // If category is "all" or undefined, show all products

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const getCategoryTitle = () => {
    if (!category || category === "all") return "All Products";
    if (category === "sale") return "Sale Items";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {getCategoryTitle()}
          </h1>
          <p className="text-muted-foreground">
            Discover our curated collection of premium products
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price || undefined}
                imageUrl={product.image_url}
                categoryName={product.categories?.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
