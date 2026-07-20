import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

export const Contact = () => {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden border-t border-border/40 bg-card-gradient py-20 md:py-28"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
      </div>

      <div className="container-tight relative z-10 text-center">
        <div className="eyebrow mb-6 justify-center">Hablemos</div>
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
          ¿Pedido corporativo, colaboración o duda? <span className="text-accent">Escríbenos.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Atendemos órdenes especiales para empresas, eventos y patrocinadores del podcast.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild variant="hero" size="lg">
            <a href="mailto:hola@almuerzodenegocios.com">
              <Mail className="h-4 w-4" />
              hola@almuerzodenegocios.com
            </a>
          </Button>
          <Button asChild variant="ghostLight" size="lg">
            <a href="#productos">
              Ver tienda
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
