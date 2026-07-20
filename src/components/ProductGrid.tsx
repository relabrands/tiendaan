import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";

export const ProductGrid = () => {
  const { data: products, isLoading, error } = useProducts();

  return (
    <section id="productos" className="relative bg-background py-20 md:py-28">
      <div className="container-tight">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">La Colección</div>
            <h2 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">
              Para quienes <span className="text-accent">construyen</span> mientras otros opinan.
            </h2>
          </div>
          <p className="max-w-md text-base text-muted-foreground">
            Cinco piezas esenciales. Materiales premium, branding sutil y la actitud que define a
            nuestra audiencia. Pedidos a toda República Dominicana.
          </p>
        </div>

        <div className="divider-accent mb-12" />

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive">
              No pudimos cargar los productos. Intenta de nuevo en un momento.
            </p>
          </div>
        )}

        {!isLoading && !error && products && products.length === 0 && (
          <div className="rounded-md border border-border/60 bg-card p-12 text-center">
            <p className="font-display text-xl font-semibold">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea tus productos desde el chat para verlos aquí.
            </p>
          </div>
        )}

        {!isLoading && products && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
