import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import logo from "@/assets/logo.png";
import { CartDrawer } from "./CartDrawer";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container-tight flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-3" aria-label="Inicio">
          <img
            src={logo}
            alt="Almuerzo de Negocios"
            className="h-9 w-auto md:h-11"
            width={220}
            height={64}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/#productos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            Tienda
          </a>
          <a
            href="/#sobre"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            El Podcast
          </a>
          <a
            href="/#faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            FAQ
          </a>
          <a
            href="/#contacto"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            aria-label="Admin"
            className="hidden rounded-md border border-border/60 bg-card/40 p-2 text-muted-foreground transition-colors hover:border-accent hover:text-accent md:inline-flex"
          >
            <Lock className="h-4 w-4" />
          </Link>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
};
