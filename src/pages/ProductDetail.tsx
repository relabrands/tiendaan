import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProduct } from "@/hooks/useProducts";
import { formatPrice, getProductImage } from "@/lib/store";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const options = product?.variants || [];
  const allSelected = options.every((o) => selected[o.name]);
  const outOfStock = (product?.stock ?? 0) <= 0;

  const handleAdd = () => {
    if (!product) return;
    if (options.length > 0 && !allSelected) {
      toast.error("Selecciona todas las opciones");
      return;
    }
    const selectedOptions = options.map((o) => ({ name: o.name, value: selected[o.name] }));
    addItem({ product, quantity: 1, selectedOptions });
    toast.success("Añadido al carrito", { description: product.title, position: "top-center" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-tight py-8 md:py-14">
          <Link
            to="/#productos"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          {!isLoading && !product && (
            <div className="rounded-md border border-border/60 bg-card p-12 text-center">
              <p className="font-display text-2xl font-bold">Producto no encontrado</p>
              <Link to="/" className="mt-4 inline-block">
                <Button variant="hero">Volver a la tienda</Button>
              </Link>
            </div>
          )}

          {product && (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-md border border-border/60 bg-card-gradient">
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    width={1024}
                    height={1024}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                {product.product_type && (
                  <span className="eyebrow mb-3">{product.product_type}</span>
                )}
                <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
                  {product.title}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-accent">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Impuestos incluidos
                  </span>
                </div>

                {product.description && (
                  <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
                )}

                {options.map((option) => (
                  <div key={option.name} className="mt-8">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {option.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const active = selected[option.name] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => setSelected((s) => ({ ...s, [option.name]: value }))}
                            className={cn(
                              "rounded-md border px-4 py-2 text-sm font-semibold transition-all",
                              active
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border/60 bg-card/40 text-foreground hover:border-accent/50",
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mt-10 flex flex-col gap-3">
                  <Button onClick={handleAdd} variant="hero" size="lg" disabled={outOfStock}>
                    <ShoppingBag className="h-4 w-4" />
                    {outOfStock ? "Agotado" : "Añadir al carrito"}
                  </Button>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-3 border-t border-border/40 pt-6 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Envío rápido</p>
                      <p className="text-xs text-muted-foreground">A toda RD en 2-7 días</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Compra confiable</p>
                      <p className="text-xs text-muted-foreground">Coordinamos pago al confirmar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;