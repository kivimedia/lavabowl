import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Simple, <span className="gradient-lava-text">transparent</span> pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No subscriptions you don't need. Pay for what you actually use.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Migration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8"
          >
            <div className="text-sm font-medium text-muted-foreground mb-2">One-time</div>
            <h3 className="text-2xl font-bold font-display mb-1">Migration</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold font-display">$29</span>
              <span className="text-muted-foreground">- $49</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["GitHub repo setup", "Database config", "Build verification", "First deployment", "Your code, your repo"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full rounded-xl">Get Started</Button>
            </Link>
          </motion.div>

          {/* Hosting - Featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-primary bg-card p-8 relative shadow-xl shadow-primary/10"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-lava text-white text-xs font-semibold">
              Most Popular
            </div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Monthly</div>
            <h3 className="text-2xl font-bold font-display mb-1">Hosting</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold font-display">$5</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Shared VPS hosting", "SSL certificate", "Uptime monitoring", "Subdomain included", "Custom domain +$3/mo"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/dashboard">
              <Button className="w-full gradient-lava border-0 text-white rounded-xl">Get Started</Button>
            </Link>
          </motion.div>

          {/* Fixes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-8"
          >
            <div className="text-sm font-medium text-muted-foreground mb-2">Pay-per-use</div>
            <h3 className="text-2xl font-bold font-display mb-1">Fixes</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold font-display">$5</span>
              <span className="text-muted-foreground">/fix</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["AI-powered repairs", "Preview before deploy", "Automatic rollback", "Plain language requests", "Complex quoted separately"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full rounded-xl">Get Started</Button>
            </Link>
          </motion.div>
        </div>

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8"
        >
          <h3 className="text-xl font-bold font-display text-center mb-6">
            Compare Your Monthly Costs
          </h3>
          <div className="space-y-4">
            {[
              { label: "Stay on Lovable", cost: "$20 – $100+", bar: 85, color: "bg-muted-foreground/30" },
              { label: "Self-host (DIY)", cost: "$0 – $20", bar: 25, note: "Requires technical skills", color: "bg-muted-foreground/30" },
              { label: "Hire a freelancer", cost: "$50 – $200/hr", bar: 95, color: "bg-muted-foreground/30" },
              { label: "LavaBowl", cost: "$5 + fixes", bar: 15, color: "gradient-lava" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.cost}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.bar}%` }}
                  />
                </div>
                {item.note && <p className="text-xs text-muted-foreground mt-1">{item.note}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
