import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/store";

export function useProducts(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ["products", opts.includeInactive ?? false],
    retry: false,
    queryFn: async (): Promise<Product[]> => {
      const q = query(collection(db, "products"), orderBy("sort_order", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let filteredData = data;
      if (!opts.includeInactive) {
        filteredData = data.filter((p: any) => p.is_active === true);
      }
      
      return filteredData.map((p: any) => ({
        ...p,
        price: Number(p.price),
        variants: normalizeVariants(p.variants),
        images: Array.isArray(p.images) ? p.images : [],
      }));
    },
  });
}

const normalizeVariants = (variants: any[]) => {
  if (!Array.isArray(variants)) return [];
  return variants.map((v) => ({
    name: v.name,
    values: (v.values || []).map((val: any) => (typeof val === "string" ? { value: val } : val)),
  }));
};

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Product | null> => {
      const q = query(collection(db, "products"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = { id: doc.id, ...doc.data() };
      
      return {
        ...(data as any),
        price: Number((data as any).price),
        variants: normalizeVariants((data as any).variants),
        images: Array.isArray((data as any).images) ? (data as any).images : [],
      } as Product;
    },
  });
}