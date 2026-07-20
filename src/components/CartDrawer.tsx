import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, getProductImage } from "@/lib/store";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem } = useCartStore();

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const currency = items[0]?.currency || "DOP";

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-border/60 bg-card/40 hover:border-accent hover:bg-card"
          aria-label="Abrir carrito"
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent p-0 px-1.5 text-[10px] font-bold text-accent-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col bg-card border-l border-border sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-2xl">Tu carrito</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Aún no has agregado nada"
              : `${totalItems} artículo${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Carrito vacío</p>
                <Link to="/#productos" onClick={() => setIsOpen(false)}>
                  <Button variant="link" className="mt-2 text-accent">
                    Explorar productos
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex gap-4 rounded-md border border-border/60 bg-background/40 p-3"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-secondary/30">
                        <img
                          src={getProductImage({ slug: item.slug, image_url: item.image_url })}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-semibold leading-tight">
                          {item.title}
                        </h4>
                        {item.variantLabel && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                        )}
                        <p className="mt-1 font-semibold text-accent">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.key)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 border-t border-border bg-card pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">Total</span>
                  <span className="font-display text-2xl font-bold text-accent">
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={items.length === 0}
                >
                  Proceder al checkout
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Coordinamos el pago contigo tras confirmar el pedido
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
