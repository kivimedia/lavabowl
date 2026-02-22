import { motion } from "framer-motion";
import { Upload, Settings, Rocket, WrenchIcon } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Share Your Project",
    description: "Provide your Lovable project export (GitHub link or ZIP) and your database credentials.",
  },
  {
    icon: Settings,
    step: "02",
    title: "We Migrate & Deploy",
    description: "We set up your repo, verify the build, containerize it, and deploy to our infrastructure.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Go Live",
    description: "Your project is live on myproject.lavabowl.app within minutes. Pay $5/mo to keep it running.",
  },
  {
    icon: WrenchIcon,
    step: "04",
    title: "Fix When Needed",
    description: "Something breaks? Submit a request, our AI fixes it, you approve, and it's live. $5 per fix.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            How it <span className="gradient-lava-text">works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From Lovable subscriber to independent project owner in four simple steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="text-6xl font-bold font-display text-primary/10 mb-4">{step.step}</div>
              <div className="w-14 h-14 rounded-2xl gradient-lava flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-display mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
