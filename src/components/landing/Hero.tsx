import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Stop paying for a builder you no longer need
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
            Your Lovable project is done.{" "}
            <span className="gradient-lava-text">Your hosting bill shouldn't burn.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            We migrate your finished Lovable project to affordable hosting, keep it running, 
            and fix things when they break — all for a fraction of what you're paying now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="gradient-lava border-0 text-white text-lg px-8 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Migrate My Project
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-xl">
                See Pricing
              </Button>
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              $5/mo hosting
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              $5/fix flat rate
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Zero technical skills
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
