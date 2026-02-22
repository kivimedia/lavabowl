import { motion } from "framer-motion";
import { GitBranch, Server, Wrench, Shield, Zap, DollarSign } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Project Migration",
    description: "We export your Lovable project to GitHub, configure your database connection, and deploy it - you own the code.",
  },
  {
    icon: Server,
    title: "$5/mo Managed Hosting",
    description: "Your project runs on our shared infrastructure with SSL, monitoring, and automatic updates included.",
  },
  {
    icon: Wrench,
    title: "AI-Powered Fixes",
    description: "Something breaks? Submit a fix request and our AI engine patches it, tests it, and deploys - $3 per fix.",
  },
  {
    icon: Shield,
    title: "Your Data, Your Control",
    description: "We never touch your database. Your existing backend stays exactly where it is, fully under your control.",
  },
  {
    icon: Zap,
    title: "Deploy in Minutes",
    description: "Most migrations complete in under 30 minutes. Your site goes live on a subdomain instantly.",
  },
  {
    icon: DollarSign,
    title: "Save 70%+ Monthly",
    description: "Stop paying for a full AI builder subscription when you only need hosting and the occasional fix.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Everything you need,{" "}
            <span className="gradient-lava-text">nothing you don't</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            LavaBowl handles the boring stuff so your finished project keeps running without the premium price tag.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-lava flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
