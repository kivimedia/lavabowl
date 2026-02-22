import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need any technical skills?",
    a: "None. You give us your Lovable project and database credentials, and we handle everything - migration, hosting, and fixes.",
  },
  {
    q: "What happens to my database?",
    a: "Nothing changes. Your Supabase project stays exactly where it is, under your account. We just connect your deployed app to it.",
  },
  {
    q: "Can I go back to Lovable later?",
    a: "Absolutely. Your code lives in a GitHub repo you own. You can reconnect it to Lovable or any other platform at any time.",
  },
  {
    q: "What counts as a 'fix' vs a 'complex change'?",
    a: "A fix is a single-scope change: fixing a bug, updating text, tweaking a style, adjusting a form field. If it requires new features, multiple files, or architectural changes, we'll quote it separately before doing any work.",
  },
  {
    q: "How fast are fixes deployed?",
    a: "Most AI-powered fixes are ready for your review within 2 hours. You approve a preview before anything goes live.",
  },
  {
    q: "Is there a limit to hosting traffic?",
    a: "Our shared hosting is designed for small-to-medium traffic projects. If your project gets massive traffic, we'll work with you on a dedicated plan.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Frequently asked <span className="gradient-lava-text">questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-6 bg-card"
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
