import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, getProductImage } from "@/lib/store";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
    notes: "",
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const currency = items[0]?.currency || "DOP";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        id: crypto.randomUUID(), // Just to have a unique ID for React keys if needed
        product_id: i.productId,
        product_title: i.title,
        variant_label: i.variantLabel || null,
        unit_price: i.price,
        quantity: i.quantity,
      }));

      const payload = {
        ...form,
        subtotal,
        currency,
        status: "pending",
        created_at: new Date().toISOString(), // Fallback
        order_items: orderItems,
      };

      const docRef = await addDoc(collection(db, "orders"), payload);

      setOrderId(docRef.id);
      clearCart();
    } catch (err: any) {
      toast.error("Error al procesar pedido", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container-tight py-20">
            <div className="mx-auto max-w-lg rounded-md border border-border/60 bg-card p-10 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h1 className="font-display text-3xl font-extrabold">¡Pedido recibido!</h1>
              <p className="mt-4 text-muted-foreground">
                Gracias por tu compra. Te contactaremos pronto para coordinar el pago y entrega.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Número de pedido: <span className="font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
              <Button variant="hero" className="mt-8" onClick={() => navigate("/")}>
                Volver a la tienda
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-tight py-8 md:py-14">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
            <ArrowLeft className="h-4 w-4" /> Seguir comprando
          </Link>

          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Finalizar compra</h1>

          {items.length === 0 ? (
            <div className="mt-10 rounded-md border border-border/60 bg-card p-12 text-center">
              <p className="text-muted-foreground">Tu carrito está vacío</p>
              <Link to="/#productos">
                <Button variant="hero" className="mt-4">Ver productos</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input id="name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="address">Dirección de entrega *</Label>
                  <Textarea id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar pedido"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Te contactaremos para coordinar pago y entrega
                </p>
              </form>

              <div className="h-fit rounded-md border border-border/60 bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Tu pedido</h2>
                <div className="space-y-3">
                  {items.map((i) => (
                    <div key={i.key} className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0">
                      <img src={getProductImage({ slug: i.slug, image_url: i.image_url })} alt={i.title} className="h-14 w-14 rounded-sm object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{i.title}</p>
                        {i.variantLabel && <p className="text-xs text-muted-foreground">{i.variantLabel}</p>}
                        <p className="text-xs text-muted-foreground">Cantidad: {i.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(i.price * i.quantity, i.currency)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display text-xl font-bold text-accent">{formatPrice(subtotal, currency)}</span>
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

export default Checkout;