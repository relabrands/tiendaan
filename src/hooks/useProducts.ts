import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/store";

export function useProducts(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ["products", opts.includeInactive ?? false],
    retry: false,
    queryFn: async (): Promise<Product[]> => {
      let q = query(collection(db, "products"), orderBy("sort_order", "asc"));
      if (!opts.includeInactive) {
        q = query(collection(db, "products"), where("is_active", "==", true), orderBy("sort_order", "asc"));
      }
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return data.map((p: any) => ({
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
      const q = query(collection(db, "products"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = { id: doc.id, ...doc.data() };
      
      return {
        ...(data as any),
        price: Number((data as any).price),
        variants: Array.isArray((data as any).variants) ? (data as any).variants : [],
        images: Array.isArray((data as any).images) ? (data as any).images : [],
      } as Product;
    },
  });
}