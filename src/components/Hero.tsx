import { Button } from "@/components/ui/button";
import { ArrowRight, Mic } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero grain">
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src={heroBg}
          alt=""
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      <div className="container-tight relative z-10 py-20 md:py-32 lg:py-40">
        <div className="max-w-4xl animate-fade-up">
          <div className="eyebrow mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Tienda Oficial · Almuerzo de Negocios
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-[5.5rem]">
            Vístete como{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-accent">se hacen negocios</span>
              <span className="absolute inset-x-0 bottom-1 h-3 -z-0 bg-accent/15 blur-sm md:bottom-2 md:h-5" />
            </span>
            .
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Merch oficial del podcast más escuchado por la nueva generación de líderes,
            emprendedores y tomadores de decisión. Diseñado con la misma obsesión que ponemos en
            cada episodio.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" variant="hero" asChild>
              <a href="#productos">
                Explorar la colección
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="ghostLight" asChild>
              <a href="#sobre">
                <Mic className="mr-1 h-4 w-4" />
                Sobre el podcast
              </a>
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-border/50 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl font-bold text-foreground">+150K</div>
              <div className="text-xs uppercase tracking-wider">Oyentes</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl font-bold text-foreground">5</div>
              <div className="text-xs uppercase tracking-wider">Productos icónicos</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-display text-2xl font-bold text-foreground">100%</div>
              <div className="text-xs uppercase tracking-wider">Calidad premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative z-10 border-y border-border/40 bg-background/40 py-5 backdrop-blur">
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {[
              "Negocios",
              "Estrategia",
              "Liderazgo",
              "Innovación",
              "Mercados",
              "Cultura",
              "Capital",
              "Negocios",
              "Estrategia",
              "Liderazgo",
              "Innovación",
              "Mercados",
              "Cultura",
              "Capital",
            ].map((word, i) => (
              <span
                key={i}
                className="font-display text-2xl font-bold uppercase tracking-tight text-muted-foreground/40 md:text-3xl"
              >
                {word} <span className="text-accent">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
