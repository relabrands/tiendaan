import tazaImg from "@/assets/product-taza.jpg";
import poloImg from "@/assets/product-polo.jpg";
import gorraImg from "@/assets/product-gorra.jpg";
import hoodieImg from "@/assets/product-hoodie.jpg";
import termoImg from "@/assets/product-termo.jpg";

export interface VariantValue {
  value: string;
  title?: string;
  image_url?: string;
}

export interface VariantOption {
  name: string;
  values: VariantValue[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  product_type: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  images: string[];
  stock: number;
  is_active: boolean;
  sort_order: number;
  variants: VariantOption[];
  is_customizable?: boolean;
  created_at: string;
  updated_at: string;
}

const SLUG_IMAGES: Record<string, string> = {
  "taza-adn": tazaImg,
  "polo-adn": poloImg,
  "gorra-adn": gorraImg,
  "hoodie-adn": hoodieImg,
  "termo-adn": termoImg,
};

export function getProductImage(p: Pick<Product, "slug" | "image_url">): string {
  if (p.image_url && /^https?:\/\//.test(p.image_url)) return p.image_url;
  return SLUG_IMAGES[p.slug] ?? "/placeholder.svg";
}

export function formatPrice(amount: number | string, currency = "DOP") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(0)}`;
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}