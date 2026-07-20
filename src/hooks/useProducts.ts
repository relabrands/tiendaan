import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/store";

export function useProducts(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ["products", opts.includeInactive ?? false],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase.from("products").select("*").order("sort_order", { ascending: true });
      if (!opts.includeInactive) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        price: Number(p.price),
        variants: Array.isArray(p.variants) ? p.variants : [],
        images: Array.isArray(p.images) ? p.images : [],
      }));
    },
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...(data as any),
        price: Number((data as any).price),
        variants: Array.isArray((data as any).variants) ? (data as any).variants : [],
        images: Array.isArray((data as any).images) ? (data as any).images : [],
      } as Product;
    },
  });
}