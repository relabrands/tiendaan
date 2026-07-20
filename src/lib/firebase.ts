import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAysDPiuIg-3JxTV3UazGqQ1Z8TJ2jJc9U",
  authDomain: "tienda-almuerzo-de-negocios.firebaseapp.com",
  projectId: "tienda-almuerzo-de-negocios",
  storageBucket: "tienda-almuerzo-de-negocios.firebasestorage.app",
  messagingSenderId: "779823702993",
  appId: "1:779823702993:web:a44c986a7141238ef636f0",
  measurementId: "G-8EHX6E8DCP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
