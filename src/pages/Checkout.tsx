import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Briefcase, CheckCircle2, Loader2, Lock, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, getProductImage } from "@/lib/store";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";

const STEPS = ["Tu información", "Dirección", "Confirmar"];

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
        id: crypto.randomUUID(),
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
        created_at: new Date().toISOString(),
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
          <div className="container-tight flex items-center justify-center py-20">
            <div className="relative mx-auto max-w-lg text-center">
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 mx-auto h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
              <div className="rounded-2xl border border-accent/30 bg-card/80 p-12 shadow-2xl backdrop-blur-sm">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-4 ring-accent/20">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h1 className="font-display text-3xl font-extrabold">¡Pedido Confirmado!</h1>
                <p className="mt-3 text-muted-foreground">
                  Tu pedido ha sido recibido. Nuestro equipo se comunicará contigo por WhatsApp para coordinar el pago y la entrega.
                </p>
                <div className="mt-6 rounded-xl border border-border/40 bg-muted/20 px-6 py-4">
                  <p className="text-xs text-muted-foreground">Número de pedido</p>
                  <p className="mt-1 font-mono text-xl font-bold tracking-widest text-accent">
                    #{orderId.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: MessageCircle, label: "WhatsApp", sub: "Coordinamos" },
                    { icon: Package, label: "Envío", sub: "2–7 días" },
                    { icon: BadgeCheck, label: "Garantía", sub: "100% seguro" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="rounded-lg border border-border/30 bg-background/60 p-3">
                      <Icon className="mx-auto mb-1 h-5 w-5 text-accent" />
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  ))}
                </div>

                <Button variant="hero" className="mt-8 w-full" onClick={() => navigate("/")}>
                  Volver a la tienda
                </Button>
              </div>
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
        {/* Hero strip */}
        <div className="border-b border-border/40 bg-card/60 py-6 backdrop-blur-sm">
          <div className="container-tight">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Seguir comprando
            </Link>
            <div className="mt-4 flex items-end gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-accent" />
                  <span className="eyebrow text-accent">Finalizar pedido</span>
                </div>
                <h1 className="font-display text-4xl font-extrabold md:text-5xl">
                  Lleva el Almuerzo de Negocios contigo.
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container-tight py-10">
          {items.length === 0 ? (
            <div className="mt-10 rounded-md border border-border/60 bg-card p-12 text-center">
              <p className="text-muted-foreground">Tu carrito está vacío</p>
              <Link to="/#productos">
                <Button variant="hero" className="mt-4">Ver productos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">

              {/* ── LEFT: Form ── */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Personal info */}
                <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">1</div>
                    <h2 className="font-display text-lg font-bold">Información de contacto</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre completo *</Label>
                        <Input
                          id="name"
                          required
                          placeholder="Tu nombre"
                          value={form.customer_name}
                          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                          className="h-11 bg-background/80"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teléfono / WhatsApp *</Label>
                        <Input
                          id="phone"
                          required
                          placeholder="+1 809 000 0000"
                          value={form.customer_phone}
                          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                          className="h-11 bg-background/80"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Correo electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={form.customer_email}
                        onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                        className="h-11 bg-background/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery */}
                <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">2</div>
                    <h2 className="font-display text-lg font-bold">Dirección de entrega</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dirección *</Label>
                      <Textarea
                        id="address"
                        required
                        placeholder="Calle, número, sector, ciudad..."
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows={3}
                        className="resize-none bg-background/80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notas adicionales <span className="normal-case font-normal text-muted-foreground/60">(opcional)</span></Label>
                      <Textarea
                        id="notes"
                        placeholder="Ej. horario de disponibilidad, instrucciones especiales..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        className="resize-none bg-background/80"
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="h-14 w-full text-base font-bold tracking-wide"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirmar pedido"
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Te contactaremos por WhatsApp para coordinar el pago y la entrega.</span>
                </div>
              </form>

              {/* ── RIGHT: Order Summary ── */}
              <div className="space-y-4">
                <div className="sticky top-20 space-y-4">
                  <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
                    <h2 className="mb-5 font-display text-lg font-bold">Resumen de tu pedido</h2>
                    <div className="space-y-4">
                      {items.map((i) => (
                        <div key={i.key} className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/60 p-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={getProductImage({ slug: i.slug, image_url: i.image_url })}
                              alt={i.title}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                              {i.quantity}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{i.title}</p>
                            {i.variantLabel && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{i.variantLabel}</p>
                            )}
                          </div>
                          <p className="shrink-0 text-sm font-bold">{formatPrice(i.price * i.quantity, i.currency)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-2 border-t border-border/40 pt-4 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal, currency)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Envío</span>
                        <span className="text-accent font-medium">A coordinar</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
                      <span className="font-display font-bold">Total</span>
                      <span className="font-display text-2xl font-extrabold text-accent">{formatPrice(subtotal, currency)}</span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
                    <div className="space-y-3">
                      {[
                        { icon: MessageCircle, title: "Coordinación por WhatsApp", desc: "Te contactamos al recibir tu pedido" },
                        { icon: Package, title: "Envío a toda RD", desc: "Entrega estimada 2–7 días hábiles" },
                        { icon: BadgeCheck, title: "Compra 100% confiable", desc: "El Almuerzo de Negocios te respalda" },
                      ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <div>
                            <p className="text-xs font-semibold">{title}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                      ))}
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

export default Checkout;