import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flame,
  ArrowLeft,
  ArrowRight,
  User,
  FolderGit2,
  Database,
  Key,
  Globe,
  CreditCard,
  Rocket,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  SkipForward,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_STEPS = 7;

const stepMeta = [
  { icon: User, label: "Your Info" },
  { icon: FolderGit2, label: "Your Project" },
  { icon: Database, label: "Supabase" },
  { icon: Key, label: "Env Variables" },
  { icon: Globe, label: "Domain" },
  { icon: CreditCard, label: "Review & Pay" },
  { icon: Rocket, label: "All Set!" },
];

const GetStarted = () => {
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Step 2
  const [projectSource, setProjectSource] = useState<"github" | "zip" | "">(
    ""
  );
  const [githubUrl, setGithubUrl] = useState("");

  // Step 3
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");

  // Step 4
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);

  // Step 5
  const [domainChoice, setDomainChoice] = useState<"subdomain" | "custom" | "">(
    ""
  );
  const [customDomain, setCustomDomain] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim() && email.trim();
      case 2:
        return (
          (projectSource === "github" && githubUrl.trim()) ||
          projectSource === "zip"
        );
      case 3:
        return supabaseUrl.trim() && anonKey.trim();
      case 4:
        return true; // optional
      case 5:
        return true; // optional
      case 6:
        return true;
      default:
        return true;
    }
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (i: number) =>
    setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i: number, field: "key" | "value", val: string) =>
    setEnvVars(envVars.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-lava flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display">LavaBowl</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {stepMeta.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <button
                key={s.label}
                onClick={() => step !== 7 && setStep(stepNum)}
                className="flex flex-col items-center gap-1.5 flex-1 group"
                disabled={step === 7}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-md ${
                    isDone
                      ? "gradient-lava text-white"
                      : isActive
                      ? "border-2 border-primary text-primary bg-primary/10"
                      : "border border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border border-border">
              <CardContent className="p-8">
                {/* STEP 1: Your Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-1">Let's get to know you</h2>
                      <p className="text-muted-foreground">We'll use this to set up your account.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jane@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Your Project */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-1">Share your project</h2>
                      <p className="text-muted-foreground">
                        How would you like to share your Lovable project with us?
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setProjectSource("github")}
                        className={`rounded-xl border-2 p-6 text-left transition-all ${
                          projectSource === "github"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <FolderGit2 className="w-6 h-6 mb-2 text-primary" />
                        <h3 className="font-semibold font-display">GitHub Link</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Paste a link to your exported repo
                        </p>
                      </button>
                      <button
                        onClick={() => setProjectSource("zip")}
                        className={`rounded-xl border-2 p-6 text-left transition-all ${
                          projectSource === "zip"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <ArrowRight className="w-6 h-6 mb-2 text-primary" />
                        <h3 className="font-semibold font-display">Upload ZIP</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload your project source code
                        </p>
                      </button>
                    </div>
                    {projectSource === "github" && (
                      <div>
                        <Label htmlFor="github">GitHub Repository URL</Label>
                        <Input
                          id="github"
                          placeholder="https://github.com/you/your-project"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    )}
                    {projectSource === "zip" && (
                      <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                        <p className="text-muted-foreground">
                          Drag & drop your ZIP file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Max 100MB - .zip files only
                        </p>
                      </div>
                    )}
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <strong>How to export from Lovable:</strong> Go to your Lovable project → Settings → GitHub → Connect & export. This creates a GitHub repo with your full source code.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3: Supabase Credentials */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-1">Supabase credentials</h2>
                      <p className="text-muted-foreground">
                        We need these to keep your app connected to your database. Your data stays yours.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="supabase-url">Supabase Project URL</Label>
                        <Input
                          id="supabase-url"
                          placeholder="https://abcdefgh.supabase.co"
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="anon-key">Anon (Public) Key</Label>
                        <Input
                          id="anon-key"
                          placeholder="eyJhbGciOiJIUzI1NiIs..."
                          value={anonKey}
                          onChange={(e) => setAnonKey(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="service-key">
                          Service Role Key <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="service-key"
                          type="password"
                          placeholder="eyJhbGciOiJIUzI1NiIs..."
                          value={serviceRoleKey}
                          onChange={(e) => setServiceRoleKey(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <strong>Where to find these:</strong> Go to your Supabase dashboard → Settings → API. Copy the Project URL, anon key, and service role key from there.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: Environment Variables (optional) */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-1">Environment variables</h2>
                      <p className="text-muted-foreground">
                        Does your project use any other API keys? (e.g., Stripe, SendGrid, etc.)
                      </p>
                    </div>
                    {envVars.length > 0 && (
                      <div className="space-y-3">
                        {envVars.map((v, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Input
                              placeholder="VARIABLE_NAME"
                              value={v.key}
                              onChange={(e) => updateEnvVar(i, "key", e.target.value)}
                              className="font-mono text-sm"
                            />
                            <Input
                              placeholder="value"
                              type="password"
                              value={v.value}
                              onChange={(e) => updateEnvVar(i, "value", e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEnvVar(i)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" onClick={addEnvVar} className="w-full rounded-xl">
                      <Plus className="w-4 h-4 mr-1" /> Add Variable
                    </Button>
                    {envVars.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        No extra variables? No problem - you can skip this step.
                      </p>
                    )}
                  </div>
                )}

                {/* STEP 5: Domain (optional) */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-1">Choose your domain</h2>
                      <p className="text-muted-foreground">
                        Every project gets a free subdomain. You can add a custom domain later too.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setDomainChoice("subdomain")}
                        className={`rounded-xl border-2 p-6 text-left transition-all ${
                          domainChoice === "subdomain"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Globe className="w-6 h-6 mb-2 text-primary" />
                        <h3 className="font-semibold font-display">Free Subdomain</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          myproject.lavabowl.app
                        </p>
                      </button>
                      <button
                        onClick={() => setDomainChoice("custom")}
                        className={`rounded-xl border-2 p-6 text-left transition-all ${
                          domainChoice === "custom"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Globe className="w-6 h-6 mb-2 text-primary" />
                        <h3 className="font-semibold font-display">Custom Domain</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          yourdomain.com (+$3/mo)
                        </p>
                      </button>
                    </div>
                    {domainChoice === "custom" && (
                      <div>
                        <Label htmlFor="custom-domain">Your Domain</Label>
                        <Input
                          id="custom-domain"
                          placeholder="myawesomesite.com"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          className="mt-1.5"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          We'll send you DNS instructions after setup.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 6: Review & Pay */}
                {step === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-1">Review & confirm</h2>
                      <p className="text-muted-foreground">
                        Here's a summary of your migration. Migration is free!
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium">{email}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-sm text-muted-foreground">Project</span>
                        <span className="text-sm font-medium">
                          {projectSource === "github" ? githubUrl : "ZIP Upload"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-sm text-muted-foreground">Domain</span>
                        <span className="text-sm font-medium">
                          {domainChoice === "custom" ? customDomain : "Free subdomain"}
                        </span>
                      </div>
                      {envVars.filter((v) => v.key).length > 0 && (
                        <div className="flex justify-between items-center py-3 border-b border-border">
                          <span className="text-sm text-muted-foreground">Env Variables</span>
                          <span className="text-sm font-medium">
                            {envVars.filter((v) => v.key).length} configured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Migration</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">$29-$49</span>
                          <span className="font-bold text-primary">Free</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Monthly Hosting</span>
                        <span className="font-bold">$5/mo</span>
                      </div>
                      {domainChoice === "custom" && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Custom Domain</span>
                          <span className="font-bold">+$3/mo</span>
                        </div>
                      )}
                      <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                        <span className="font-semibold">Due today</span>
                        <span className="text-xl font-bold text-primary">$0</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Hosting billing starts after your project is live. First 30 fixes at $3 each.
                      </p>
                    </div>
                    <Button
                      onClick={next}
                      className="w-full gradient-lava border-0 text-white h-12 rounded-xl text-base"
                    >
                      Confirm & Start Migration
                    </Button>
                  </div>
                )}

                {/* STEP 7: All Set */}
                {step === 7 && (
                  <div className="text-center py-8 space-y-6">
                    <div className="w-16 h-16 rounded-full gradient-lava flex items-center justify-center mx-auto">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display mb-2">We're on it!</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        We're verifying your build and setting up your hosting. You'll get an email at{" "}
                        <strong className="text-foreground">{email}</strong> once your project is live.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-5 text-left space-y-3 max-w-sm mx-auto">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm">Project received</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-primary animate-pulse" />
                        <span className="text-sm">Build verification in progress</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-border" />
                        <span className="text-sm text-muted-foreground">Deploying to hosting</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-border" />
                        <span className="text-sm text-muted-foreground">Going live</span>
                      </div>
                    </div>
                    <Link to="/dashboard">
                      <Button variant="outline" className="rounded-xl">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 6 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 1}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {(step === 4 || step === 5) && (
                <Button variant="ghost" onClick={next} className="rounded-xl text-muted-foreground">
                  <SkipForward className="w-4 h-4 mr-1" /> Skip
                </Button>
              )}
              <Button
                onClick={next}
                disabled={!canProceed()}
                className="gradient-lava border-0 text-white rounded-xl"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GetStarted;
