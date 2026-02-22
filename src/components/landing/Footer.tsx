import { Flame } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-lava flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display">LavaBowl</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Kivi Media. Affordable hosting for finished Lovable projects.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
