import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb } from "lucide-react";

const StillUpdate = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Can I still update my{" "}
            <span className="gradient-lava-text">project?</span>
          </h2>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xl mb-8">
            <CheckCircle2 className="w-6 h-6" />
            Yes, absolutely.
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Once your project is on LavaBowl, you can request fixes and small changes anytime through our AI-powered fix engine. Need a text change, a bug fix, or a layout tweak? Just describe it and we handle it - $3 per fix.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-muted/30 p-8 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-display mb-2">
                  Still making big changes? Stay on Lovable.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you're still actively building - adding new pages, reworking features, or making major design changes - Lovable is the right tool for the job. Keep using it until you feel like the $25/month subscription is a bit much for the occasional fix here and there. That's when LavaBowl makes sense. We'll be here when you're ready.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StillUpdate;
