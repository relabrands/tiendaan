import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Package, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice, slugify, type Product, type VariantOption } from "@/lib/store";
import { toast } from "sonner";

interface ProductForm {
  id?: string;
  slug: string;
  title: string;
  description: string;
  product_type: string;
  price: number;
  image_url: string;
  variants: VariantOption[];
  stock: number;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: ProductForm = {
  slug: "",
  title: "",
  description: "",
  product_type: "",
  price: 0,
  image_url: "",
  variants: [],
  stock: 0,
  is_active: true,
  sort_order: 0,
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="font-display text-3xl font-bold">Sin acceso</h1>
        <p className="max-w-md text-muted-foreground">
          Tu cuenta no tiene permisos de administrador. Contacta al administrador para que te asigne acceso.
        </p>
        <Button variant="outline" onClick={() => signOut(auth).then(() => navigate("/auth"))}>
          <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    );
  }

  return <AdminPanel />;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: products, isLoading } = useProducts({ includeInactive: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [variantJson, setVariantJson] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyForm);
    setVariantJson("");
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description || "",
      product_type: p.product_type || "",
      price: p.price,
      image_url: p.image_url || "",
      variants: p.variants,
      stock: p.stock,
      is_active: p.is_active,
      sort_order: p.sort_order,
    });
    setVariantJson(
      p.variants.length
        ? p.variants.map((v) => `${v.name}: ${v.values.join(", ")}`).join("\n")
        : "",
    );
    setDialogOpen(true);
  };

  const parseVariants = (text: string): VariantOption[] => {
    if (!text.trim()) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, values] = line.split(":");
        return {
          name: (name || "").trim(),
          values: (values || "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        };
      })
      .filter((v) => v.name && v.values.length);
  };

  const save = async () => {
    if (!form.title) return toast.error("Título requerido");
    setSaving(true);
    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      description: form.description,
      product_type: form.product_type,
      price: form.price,
      image_url: form.image_url || null,
      variants: parseVariants(variantJson) as any,
      stock: form.stock,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };
    try {
      if (form.id) {
        await updateDoc(doc(db, "products", form.id), payload);
      } else {
        await addDoc(collection(db, "products"), payload);
      }
      setSaving(false);
      toast.success(form.id ? "Producto actualizado" : "Producto creado");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      setSaving(false);
      toast.error("Error al guardar", { description: error.message });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Producto eliminado");
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container-tight flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-lg font-bold">ADN · Admin</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">Ver tienda</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-1 h-4 w-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container-tight py-8">
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" />Productos</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="mr-2 h-4 w-4" />Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Inventario</h2>
              <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> Nuevo producto</Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((p) => (
                      <tr key={p.id} className="border-b border-border/40 last:border-0">
                        <td className="p-3">
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.slug}</p>
                        </td>
                        <td className="p-3">{p.product_type || "—"}</td>
                        <td className="p-3">{formatPrice(p.price, p.currency)}</td>
                        <td className="p-3">
                          <span className={p.stock <= 5 ? "text-destructive font-semibold" : ""}>{p.stock}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant={p.is_active ? "default" : "secondary"}>
                            {p.is_active ? "Activo" : "Oculto"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <Label>Tipo</Label>
                <Input value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} placeholder="Taza, Polo..." />
              </div>
              <div>
                <Label>Precio (DOP)</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>URL de imagen (opcional)</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              <p className="mt-1 text-xs text-muted-foreground">Deja en blanco para usar la imagen por defecto del slug.</p>
            </div>
            <div>
              <Label>Variantes (una por línea, formato: Nombre: valor1, valor2)</Label>
              <Textarea rows={3} value={variantJson} onChange={(e) => setVariantJson(e.target.value)} placeholder="Talla: S, M, L, XL" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label className="cursor-pointer">Publicado en la tienda</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  notes: string | null;
  subtotal: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: Array<{ id: string; product_title: string; variant_label: string | null; unit_price: number; quantity: number }>;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const OrdersTab = () => {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return data as unknown as OrderRow[];
    },
  });

  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success("Estado actualizado");
      qc.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    }
  };

  const totalRevenue = useMemo(
    () => (orders || []).filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.subtotal), 0),
    [orders],
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border/60 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Pedidos</p>
          <p className="mt-1 font-display text-2xl font-bold">{orders?.length ?? 0}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Pendientes</p>
          <p className="mt-1 font-display text-2xl font-bold">{orders?.filter((o) => o.status === "pending").length ?? 0}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Ingresos (excl. cancelados)</p>
          <p className="mt-1 font-display text-2xl font-bold text-accent">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {(orders || []).length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card p-12 text-center text-muted-foreground">
          Aún no hay pedidos.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => (
                <Fragment key={o.id}>
                  <tr className="border-b border-border/40 last:border-0">
                    <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString("es-DO")}</td>
                    <td className="p-3">
                      <p className="font-semibold">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                    </td>
                    <td className="p-3 font-semibold">{formatPrice(Number(o.subtotal), o.currency)}</td>
                    <td className="p-3">
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                        {expanded === o.id ? "Ocultar" : "Ver"}
                      </Button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="bg-muted/20">
                      <td colSpan={5} className="p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="text-xs">
                            <p><strong>Email:</strong> {o.customer_email}</p>
                            <p><strong>Dirección:</strong> {o.address}</p>
                            {o.notes && <p><strong>Notas:</strong> {o.notes}</p>}
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Artículos</p>
                            <ul className="space-y-1 text-xs">
                              {o.order_items?.map((it) => (
                                <li key={it.id} className="flex justify-between">
                                  <span>{it.quantity}× {it.product_title} {it.variant_label && `(${it.variant_label})`}</span>
                                  <span>{formatPrice(Number(it.unit_price) * it.quantity, o.currency)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;