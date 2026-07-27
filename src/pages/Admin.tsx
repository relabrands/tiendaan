import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Calculator, 
  Coins, 
  DollarSign, 
  Loader2, 
  LogOut, 
  Package, 
  Pencil, 
  Percent, 
  Plus, 
  Receipt, 
  ShoppingCart, 
  Trash2, 
  TrendingUp 
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface ProductForm {
  id?: string;
  slug: string;
  title: string;
  description: string;
  product_type: string;
  price: number;
  cost_without_itbis: number;
  itbis_rate: number;
  cost_with_itbis: number;
  desired_margin_pct: number | "";
  image_url: string;
  variants: VariantOption[];
  stock: number;
  is_active: boolean;
  is_customizable: boolean;
  sort_order: number;
}

const emptyForm: ProductForm = {
  slug: "",
  title: "",
  description: "",
  product_type: "",
  price: 0,
  cost_without_itbis: 0,
  itbis_rate: 18,
  cost_with_itbis: 0,
  desired_margin_pct: "",
  image_url: "",
  variants: [],
  stock: 0,
  is_active: true,
  is_customizable: false,
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
  const { data: products, isLoading, error: productsError } = useProducts({ includeInactive: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    const costWithout = p.cost_without_itbis || 0;
    const itbisRate = p.itbis_rate ?? 18;
    const costWith = p.cost_with_itbis || (costWithout ? Math.round(costWithout * (1 + itbisRate / 100)) : 0);
    const price = p.price || 0;
    const margin = price > 0 && costWith > 0 ? parseFloat((((price - costWith) / price) * 100).toFixed(1)) : "";

    setForm({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description || "",
      product_type: p.product_type || "",
      price: price,
      cost_without_itbis: costWithout,
      itbis_rate: itbisRate,
      cost_with_itbis: costWith,
      desired_margin_pct: margin,
      image_url: p.image_url || "",
      variants: p.variants || [],
      stock: p.stock || 0,
      is_active: p.is_active,
      is_customizable: p.is_customizable || false,
      sort_order: p.sort_order || 0,
    });
    setDialogOpen(true);
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
      cost_without_itbis: form.cost_without_itbis,
      itbis_rate: form.itbis_rate,
      cost_with_itbis: form.cost_with_itbis,
      image_url: form.image_url || null,
      variants: form.variants as any,
      stock: form.stock,
      is_active: form.is_active,
      is_customizable: form.is_customizable,
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
            <TabsTrigger value="finance"><Calculator className="mr-2 h-4 w-4" />Contabilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Inventario</h2>
              <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> Nuevo producto</Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : productsError ? (
              <div className="rounded-md border border-destructive bg-destructive/10 p-6 text-center text-destructive">
                <p className="font-bold">Error al cargar inventario</p>
                <p className="text-sm mt-1">{String(productsError)}</p>
                <p className="text-xs mt-4">Nota: Si es un error de permisos (missing or insufficient permissions), verifica las Reglas de Firestore.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Costo c/ ITBIS</th>
                      <th className="p-3">Precio Venta</th>
                      <th className="p-3">Margen %</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((p) => {
                      const costWithout = p.cost_without_itbis || 0;
                      const rate = p.itbis_rate ?? 18;
                      const costWith = p.cost_with_itbis || (costWithout ? costWithout * (1 + rate / 100) : 0);
                      const profit = p.price - costWith;
                      const marginPct = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : "0";

                      return (
                        <tr key={p.id} className="border-b border-border/40 last:border-0">
                          <td className="p-3">
                            <p className="font-semibold">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.slug}</p>
                          </td>
                          <td className="p-3">{p.product_type || "—"}</td>
                          <td className="p-3 font-mono text-xs">{costWith ? formatPrice(costWith, p.currency) : "—"}</td>
                          <td className="p-3 font-semibold">{formatPrice(p.price, p.currency)}</td>
                          <td className="p-3">
                            {costWith > 0 ? (
                              <Badge variant={Number(marginPct) >= 30 ? "default" : "secondary"}>
                                {marginPct}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
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
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="finance" className="mt-6">
            <FinanceTab />
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
                <Label>Precio de Venta (DOP) *</Label>
                <Input 
                  type="number" 
                  min={0} 
                  value={form.price} 
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value) || 0;
                    const costWith = form.cost_with_itbis || 0;
                    const newMargin = newPrice > 0 && costWith > 0 ? parseFloat((((newPrice - costWith) / newPrice) * 100).toFixed(1)) : "";
                    setForm({ ...form, price: newPrice, desired_margin_pct: newMargin });
                  }} 
                />
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

            {/* Accounting / Cost Structure Section */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-accent" />
                  <h4 className="font-display text-sm font-bold text-foreground">Estructura de Costos y Margen</h4>
                </div>
                <span className="text-[11px] text-muted-foreground">Auto-calcula precio según costo y %</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <Label className="text-xs font-medium">Costo s/ ITBIS (DOP)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    step="any"
                    placeholder="0.00"
                    value={form.cost_without_itbis || ""} 
                    onChange={(e) => {
                      const costWithout = parseFloat(e.target.value) || 0;
                      const rate = form.itbis_rate || 18;
                      const costWith = Math.round(costWithout * (1 + rate / 100) * 100) / 100;
                      let newPrice = form.price;
                      if (typeof form.desired_margin_pct === "number" && form.desired_margin_pct < 100 && costWith > 0) {
                        newPrice = Math.round(costWith / (1 - form.desired_margin_pct / 100));
                      }
                      setForm({ ...form, cost_without_itbis: costWithout, cost_with_itbis: costWith, price: newPrice });
                    }} 
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Tasa ITBIS (%)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100}
                    placeholder="18"
                    value={form.itbis_rate} 
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      const costWithout = form.cost_without_itbis || 0;
                      const costWith = Math.round(costWithout * (1 + rate / 100) * 100) / 100;
                      let newPrice = form.price;
                      if (typeof form.desired_margin_pct === "number" && form.desired_margin_pct < 100 && costWith > 0) {
                        newPrice = Math.round(costWith / (1 - form.desired_margin_pct / 100));
                      }
                      setForm({ ...form, itbis_rate: rate, cost_with_itbis: costWith, price: newPrice });
                    }} 
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Costo c/ ITBIS (DOP)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    step="any"
                    placeholder="0.00"
                    value={form.cost_with_itbis || ""} 
                    onChange={(e) => {
                      const costWith = parseFloat(e.target.value) || 0;
                      const rate = form.itbis_rate || 18;
                      const costWithout = Math.round((costWith / (1 + rate / 100)) * 100) / 100;
                      let newPrice = form.price;
                      if (typeof form.desired_margin_pct === "number" && form.desired_margin_pct < 100 && costWith > 0) {
                        newPrice = Math.round(costWith / (1 - form.desired_margin_pct / 100));
                      }
                      setForm({ ...form, cost_with_itbis: costWith, cost_without_itbis: costWithout, price: newPrice });
                    }} 
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-accent">% Margen Deseado</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min={0}
                      max={99.9}
                      step="any"
                      placeholder="Ej. 25"
                      className="border-accent/40 bg-accent/10 font-bold focus:border-accent"
                      value={form.desired_margin_pct} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setForm({ ...form, desired_margin_pct: "" });
                          return;
                        }
                        const marginPct = parseFloat(val) || 0;
                        const costWith = form.cost_with_itbis || 0;
                        let newPrice = form.price;
                        if (marginPct < 100 && costWith > 0) {
                          newPrice = Math.round(costWith / (1 - marginPct / 100));
                        }
                        setForm({ ...form, desired_margin_pct: marginPct, price: newPrice });
                      }} 
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Calculated Summary Badges */}
              {(() => {
                const price = form.price || 0;
                const costWith = form.cost_with_itbis || 0;
                const costWithout = form.cost_without_itbis || 0;
                const itbisAmount = costWith - costWithout;
                const profit = price - costWith;
                const marginPct = price > 0 ? ((profit / price) * 100).toFixed(1) : "0.0";
                const isProfitable = profit >= 0;

                return (
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:grid-cols-4">
                    <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                      <p className="text-muted-foreground font-medium">ITBIS por Unidad</p>
                      <p className="font-bold text-foreground mt-0.5">{formatPrice(itbisAmount)}</p>
                    </div>
                    <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                      <p className="text-muted-foreground font-medium">Ganancia Neta/U</p>
                      <p className={cn("font-bold mt-0.5", isProfitable ? "text-emerald-600" : "text-destructive")}>
                        {formatPrice(profit)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                      <p className="text-muted-foreground font-medium">Margen Real</p>
                      <p className={cn("font-bold mt-0.5", isProfitable ? "text-emerald-600" : "text-destructive")}>
                        {marginPct}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                      <p className="text-muted-foreground font-medium">Beneficio Stock Total</p>
                      <p className="font-bold text-accent mt-0.5">{formatPrice(profit * (form.stock || 0))}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <Label>URL de imagen (opcional)</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              <p className="mt-1 text-xs text-muted-foreground">Deja en blanco para usar la imagen por defecto del slug.</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Variantes (Talla, Color, etc.)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setForm({ ...form, variants: [...form.variants, { name: "", values: [{ value: "", title: "" }] }] })}
                >
                  <Plus className="mr-1 h-3 w-3" /> Añadir grupo
                </Button>
              </div>
              <div className="space-y-4">
                {form.variants.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin variantes configuradas.</p>
                )}
                {form.variants.map((v, i) => (
                  <div key={i} className="rounded-md border border-border/40 p-3 bg-muted/10 space-y-3">
                    <div className="flex gap-2 items-center">
                      <Input 
                        className="font-bold bg-background"
                        placeholder="Nombre de la Variante (ej. Talla, Color)" 
                        value={v.name}
                        onChange={(e) => {
                          const newVariants = [...form.variants];
                          newVariants[i].name = e.target.value;
                          setForm({ ...form, variants: newVariants });
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          const newVariants = [...form.variants];
                          newVariants.splice(i, 1);
                          setForm({ ...form, variants: newVariants });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="pl-4 border-l-2 border-border/40 space-y-2">
                      <Label className="text-xs text-muted-foreground">Opciones</Label>
                      {v.values.map((val, j) => (
                        <div key={j} className="flex gap-2 items-start flex-wrap sm:flex-nowrap">
                          <Input 
                            className="bg-background min-w-[120px] flex-1"
                            placeholder="Valor (ej. Azul)" 
                            value={val.value}
                            onChange={(e) => {
                              const newVariants = [...form.variants];
                              newVariants[i].values[j].value = e.target.value;
                              setForm({ ...form, variants: newVariants });
                            }}
                          />
                          <Input 
                            className="bg-background min-w-[120px] flex-1"
                            placeholder="Título opcional" 
                            value={val.title || ""}
                            onChange={(e) => {
                              const newVariants = [...form.variants];
                              newVariants[i].values[j].title = e.target.value;
                              setForm({ ...form, variants: newVariants });
                            }}
                          />
                          <Input 
                            className="bg-background min-w-[120px] flex-1"
                            placeholder="URL Imagen opcional" 
                            value={val.image_url || ""}
                            onChange={(e) => {
                              const newVariants = [...form.variants];
                              newVariants[i].values[j].image_url = e.target.value;
                              setForm({ ...form, variants: newVariants });
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              const newVariants = [...form.variants];
                              newVariants[i].values.splice(j, 1);
                              setForm({ ...form, variants: newVariants });
                            }}
                          >
                            <Trash2 className="h-4 w-4 opacity-50 hover:opacity-100" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const newVariants = [...form.variants];
                          newVariants[i].values.push({ value: "", title: "" });
                          setForm({ ...form, variants: newVariants });
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Añadir valor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label className="cursor-pointer">Publicado en la tienda</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_customizable} onCheckedChange={(v) => setForm({ ...form, is_customizable: v })} />
                <Label className="cursor-pointer">Permite nombre personalizado</Label>
              </div>
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
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    retry: false,
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
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
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
                    <tr className="bg-muted/10 shadow-inner">
                      <td colSpan={5} className="p-0">
                        <div className="grid grid-cols-1 divide-y divide-border/40 md:grid-cols-2 md:divide-x md:divide-y-0">
                          <div className="p-6 text-sm">
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Datos del Cliente
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium">{o.customer_email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Dirección de Entrega</p>
                                <p className="font-medium">{o.address}</p>
                              </div>
                              {o.notes && (
                                <div className="rounded-md bg-accent/10 p-3">
                                  <p className="text-xs font-semibold text-accent-foreground">Notas del pedido:</p>
                                  <p className="mt-1 text-sm italic">{o.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Artículos ({o.order_items?.length || 0})
                            </h4>
                            <ul className="space-y-3 text-sm">
                              {o.order_items?.map((it) => (
                                <li key={it.id} className="flex justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">
                                      {it.quantity}× {it.product_title}
                                    </p>
                                    {it.variant_label && (
                                      <div className="mt-2 flex flex-col gap-1.5">
                                        {it.variant_label.split(" · ").map((label, idx) => {
                                          const isCustom = label.toLowerCase().includes("personalizaci");
                                          return (
                                            <span 
                                              key={idx} 
                                              className={cn(
                                                "inline-block w-fit rounded-md px-2 py-1 text-xs",
                                                isCustom 
                                                  ? "bg-accent/20 text-accent-foreground font-medium border border-accent/30" 
                                                  : "bg-muted text-muted-foreground"
                                              )}
                                            >
                                              {label}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {formatPrice(Number(it.unit_price) * it.quantity, o.currency)}
                                  </span>
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
        </div>
      )}
    </div>
  );
};

const FinanceTab = () => {
  const { data: products, isLoading: loadingProducts } = useProducts({ includeInactive: true });
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    retry: false,
    queryFn: async () => {
      const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as OrderRow[];
    },
  });

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    (products || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const financialSummary = useMemo(() => {
    const activeOrders = (orders || []).filter((o) => o.status !== "cancelled");
    let totalSalesRevenue = 0;
    let totalSalesCOGS = 0;
    let totalSalesITBIS = 0;

    activeOrders.forEach((order) => {
      totalSalesRevenue += Number(order.subtotal || 0);
      (order.order_items || []).forEach((item) => {
        const prod = productMap.get(item.product_id);
        const unitCostWith = prod?.cost_with_itbis || 0;
        const unitCostWithout = prod?.cost_without_itbis || 0;
        totalSalesCOGS += unitCostWith * item.quantity;
        totalSalesITBIS += (unitCostWith - unitCostWithout) * item.quantity;
      });
    });

    const netSalesProfit = totalSalesRevenue - totalSalesCOGS;
    const salesMarginPct = totalSalesRevenue > 0 ? (netSalesProfit / totalSalesRevenue) * 100 : 0;

    let invTotalStock = 0;
    let invCostWithoutITBIS = 0;
    let invCostWithITBIS = 0;
    let invRetailValue = 0;

    (products || []).forEach((p) => {
      const stock = p.stock || 0;
      const costWithout = p.cost_without_itbis || 0;
      const rate = p.itbis_rate ?? 18;
      const costWith = p.cost_with_itbis || (costWithout ? costWithout * (1 + rate / 100) : 0);
      const price = p.price || 0;

      invTotalStock += stock;
      invCostWithoutITBIS += costWithout * stock;
      invCostWithITBIS += costWith * stock;
      invRetailValue += price * stock;
    });

    const invPotentialProfit = invRetailValue - invCostWithITBIS;
    const invMarginPct = invRetailValue > 0 ? (invPotentialProfit / invRetailValue) * 100 : 0;

    return {
      totalSalesRevenue,
      totalSalesCOGS,
      totalSalesITBIS,
      netSalesProfit,
      salesMarginPct,
      invTotalStock,
      invCostWithoutITBIS,
      invCostWithITBIS,
      invRetailValue,
      invPotentialProfit,
      invMarginPct,
    };
  }, [orders, products, productMap]);

  if (loadingProducts || loadingOrders) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-bold">Resumen Contable & Margenes de Ganancia</h3>
        <p className="text-xs text-muted-foreground">
          Análisis de costos, ITBIS (18%), margen bruto, ingresos de ventas e inventario valorado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingresos por Ventas</p>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{formatPrice(financialSummary.totalSalesRevenue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Excluye pedidos cancelados</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Costo de Mercancía Vendida (COGS)</p>
            <Receipt className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{formatPrice(financialSummary.totalSalesCOGS)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Incluye ITBIS de costo</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ganancia Neta Ventas</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className={cn("mt-2 font-display text-2xl font-bold", financialSummary.netSalesProfit >= 0 ? "text-emerald-500" : "text-destructive")}>
            {formatPrice(financialSummary.netSalesProfit)}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            Margen de venta: {financialSummary.salesMarginPct.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor Inv. (Costo c/ ITBIS)</p>
            <Coins className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{formatPrice(financialSummary.invCostWithITBIS)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Valor Venta: {formatPrice(financialSummary.invRetailValue)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border/60 bg-muted/20 p-4 flex items-center justify-between">
          <div>
            <h4 className="font-display text-base font-bold">Análisis de Costos y Margen por Producto</h4>
            <p className="text-xs text-muted-foreground">Desglose de costo unitario sin/con ITBIS, precio de venta, margen y beneficio total de stock.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {products?.length || 0} Productos
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-right">Costo s/ ITBIS</th>
                <th className="p-3 text-right">ITBIS</th>
                <th className="p-3 text-right">Costo c/ ITBIS</th>
                <th className="p-3 text-right">Precio Venta</th>
                <th className="p-3 text-right">Ganancia / U</th>
                <th className="p-3 text-right">Margen %</th>
                <th className="p-3 text-right">Ganancia Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {(products || []).map((p) => {
                const stock = p.stock || 0;
                const costWithout = p.cost_without_itbis || 0;
                const rate = p.itbis_rate ?? 18;
                const costWith = p.cost_with_itbis || (costWithout ? costWithout * (1 + rate / 100) : 0);
                const itbisAmt = costWith - costWithout;
                const price = p.price || 0;
                const profitPerUnit = price - costWith;
                const marginPct = price > 0 ? ((profitPerUnit / price) * 100) : 0;
                const stockProfit = profitPerUnit * stock;

                return (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-semibold">
                      <p>{p.title}</p>
                      <p className="text-xs text-muted-foreground font-normal">{p.product_type || "General"}</p>
                    </td>
                    <td className="p-3 text-center font-medium">{stock}</td>
                    <td className="p-3 text-right font-mono text-xs">{formatPrice(costWithout)}</td>
                    <td className="p-3 text-right font-mono text-xs text-muted-foreground">{formatPrice(itbisAmt)} ({rate}%)</td>
                    <td className="p-3 text-right font-mono text-xs font-semibold">{formatPrice(costWith)}</td>
                    <td className="p-3 text-right font-mono text-xs font-bold text-accent">{formatPrice(price)}</td>
                    <td className={cn("p-3 text-right font-mono text-xs font-semibold", profitPerUnit >= 0 ? "text-emerald-600" : "text-destructive")}>
                      {formatPrice(profitPerUnit)}
                    </td>
                    <td className="p-3 text-right font-mono text-xs">
                      <Badge variant={marginPct >= 30 ? "default" : marginPct > 0 ? "secondary" : "destructive"}>
                        {marginPct.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-xs font-bold text-emerald-600">
                      {formatPrice(stockProfit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;