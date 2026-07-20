import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿Cuánto tarda el envío?",
    a: "Los pedidos dentro de Santo Domingo se entregan en 2-3 días hábiles. Para el resto del país, entre 4-7 días. Recibirás tracking por correo apenas tu pedido salga.",
  },
  {
    q: "¿Hacen envíos internacionales?",
    a: "Sí, enviamos a toda LATAM y a Estados Unidos. El costo y tiempo de entrega se calcula al momento del checkout según tu dirección.",
  },
  {
    q: "¿Cuál es la política de devoluciones?",
    a: "Tienes hasta 14 días desde la entrega para solicitar cambio o devolución, siempre que el producto esté en perfecto estado y con su empaque original.",
  },
  {
    q: "¿Las prendas encogen al lavar?",
    a: "Usamos algodón pre-encogido de alta calidad. Lavando en frío y secando al aire, mantendrás tu prenda intacta por mucho tiempo.",
  },
  {
    q: "¿Aceptan pedidos corporativos al por mayor?",
    a: "Sí. Para órdenes de más de 20 unidades ofrecemos descuentos por volumen y posibilidad de personalización. Escríbenos a corporativo@almuerzodenegocios.com",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="relative bg-background py-20 md:py-28">
      <div className="container-tight grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="eyebrow mb-4">Preguntas Frecuentes</div>
          <h2 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Todo lo que necesitas <span className="text-accent">saber</span>.
          </h2>
          <p className="mt-6 text-muted-foreground">
            ¿No encuentras tu respuesta? Escríbenos directamente y te contestamos en menos de 24
            horas.
          </p>
        </div>

        <div className="lg:col-span-2">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-border/60 first:border-t"
              >
                <AccordionTrigger className="py-5 text-left font-display text-lg font-semibold hover:text-accent hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
