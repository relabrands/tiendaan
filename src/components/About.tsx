import { Mic, Headphones, TrendingUp } from "lucide-react";

export const About = () => {
  return (
    <section
      id="sobre"
      className="relative overflow-hidden border-y border-border/40 bg-card-gradient py-20 md:py-28"
    >
      <div className="container-tight grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <div className="eyebrow mb-4">El Podcast</div>
          <h2 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Conversaciones que <span className="text-accent">mueven</span> mercados.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Almuerzo de Negocios</strong> nació de la necesidad
            de tener conversaciones honestas sobre lo que realmente pasa en el mundo empresarial.
            Sin filtros, sin frases prefabricadas. Solo líderes contando cómo se hacen las cosas.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Cada semana sentamos en la mesa a CEOs, fundadores, inversionistas y figuras clave de
            la economía regional. Mientras almuerzan, nosotros escuchamos. Y tú también.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            {
              Icon: Mic,
              title: "Voces que importan",
              text: "Líderes empresariales, fundadores y disruptores compartiendo lo que no aparece en los reportes.",
            },
            {
              Icon: Headphones,
              title: "+150K oyentes",
              text: "Una comunidad de profesionales y emprendedores en LATAM y el Caribe.",
            },
            {
              Icon: TrendingUp,
              title: "Estrategia real",
              text: "Casos, decisiones y aprendizajes accionables. Nada de teoría sin contexto.",
            },
            {
              Icon: Mic,
              title: "Episodios semanales",
              text: "Nuevos almuerzos cada semana, en todas las plataformas de podcast.",
            },
          ].map(({ Icon, title, text }, i) => (
            <div
              key={i}
              className="group rounded-md border border-border/60 bg-background/40 p-6 transition-all hover:border-accent/40"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
