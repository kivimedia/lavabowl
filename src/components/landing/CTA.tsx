import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl gradient-lava p-12 md:p-20 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-4">
              Ready to stop overpaying?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Migrate your Lovable project in under 30 minutes. Keep it running for $5/month.
            </p>
            <Link to="/get-started">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 text-lg px-8 h-14 rounded-xl font-semibold"
              >
                Migrate My Project
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
