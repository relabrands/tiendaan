import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, getProductImage, type Product } from "@/lib/store";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const hasOptions = product.variants.length > 0;
  const outOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasOptions) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    addItem({ product, quantity: 1, selectedOptions: [] });
    toast.success("Añadido al carrito", { description: product.title, position: "top-center" });
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block overflow-hidden rounded-md border border-border/60 bg-card-gradient transition-all duration-500 hover:border-accent/40 hover:shadow-elegant"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <img
          src={getProductImage(product)}
          alt={product.title}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.product_type && (
          <span className="absolute left-4 top-4 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
            {product.product_type}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-4 top-4 rounded-full bg-destructive px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-destructive-foreground">
            Agotado
          </span>
        )}

        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Button onClick={handleQuickAdd} variant="hero" size="sm" className="w-full" disabled={outOfStock}>
            <ShoppingBag className="h-4 w-4" />
            {outOfStock ? "Agotado" : hasOptions ? "Ver opciones" : "Añadir al carrito"}
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold leading-tight transition-colors group-hover:text-accent">
            {product.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            {hasOptions ? `${product.variants[0].values.length} variantes` : "Edición exclusiva"}
          </p>
        </div>
        <div className="font-display text-xl font-bold text-accent">
          {formatPrice(product.price, product.currency)}
        </div>
      </div>
    </Link>
  );
};
