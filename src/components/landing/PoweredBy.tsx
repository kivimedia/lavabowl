import { motion } from "framer-motion";
import { Bot, Cpu, Sparkles, Code2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const models = [
  { name: "Claude Code", version: "Opus 4.6", description: "Anthropic's advanced coding agent" },
  { name: "GPT-4o", version: "5.3", description: "OpenAI's multimodal powerhouse" },
  { name: "Gemini", version: "Pro 3.1", description: "Google's flagship AI model" },
];

const PoweredBy = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Fix Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Your fixes, powered by the{" "}
            <span className="gradient-lava-text">best AI models</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We don't lock you into one model. Our fix engine routes your request to the best coding AI for the job - Claude Code, GPT-4o, Gemini, and more.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-12">
          {models.map((model, i) => {
            const isComingSoon = model.name === "GPT-4o" || model.name === "Gemini";
            return (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border border-border bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300${isComingSoon ? " opacity-60" : ""}`}
              >
                {isComingSoon && (
                  <Badge className="absolute top-3 right-3 text-xs" variant="secondary">
                    Coming Soon
                  </Badge>
                )}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold font-display mb-1">
                  {model.name}{" "}
                  <span className="text-primary text-xs font-medium">{model.version}</span>
                </h3>
                <p className="text-sm text-muted-foreground">{model.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8"
        >
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <h4 className="font-semibold font-display text-sm">Smart Routing</h4>
              <p className="text-xs text-muted-foreground">Each fix is routed to the model best suited for the task</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              <h4 className="font-semibold font-display text-sm">Model Agnostic</h4>
              <p className="text-xs text-muted-foreground">New models get added as they launch - you always get the best</p>
            </div>
          </div>
          <p className="text-center text-primary font-semibold mt-6 text-sm">
            Pay only on fixes and updates when needed
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PoweredBy;
