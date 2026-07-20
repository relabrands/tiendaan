import { Instagram, Youtube, Music } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <div className="container-tight">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img
              src={logo}
              alt="Almuerzo de Negocios"
              className="h-12 w-auto"
              width={240}
              height={64}
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              El podcast de negocios que vino a sentarse a la mesa. Tienda oficial de merchandising.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-foreground">
              Tienda
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#productos" className="text-muted-foreground hover:text-accent">
                  Productos
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-muted-foreground hover:text-accent">
                  Envíos
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-muted-foreground hover:text-accent">
                  Devoluciones
                </a>
              </li>
              <li>
                <a href="/#contacto" className="text-muted-foreground hover:text-accent">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-foreground">
              Síguenos
            </h4>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: Music, label: "Spotify" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-all hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-accent mt-12" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Almuerzo de Negocios. Todos los derechos reservados.</p>
          <p>Hecho con ☕ en República Dominicana</p>
        </div>
      </div>
    </footer>
  );
};
