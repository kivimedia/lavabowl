import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Flame,
  Globe,
  Activity,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

const mockProject = {
  name: "My Portfolio Site",
  url: "myportfolio.lavabowl.app",
  status: "online",
  uptime: "99.8%",
  lastDeployed: "Feb 18, 2026",
  plan: "Hosting - $5/mo",
};

const mockFixes = [
  { id: 1, title: "Fix contact form not sending emails", status: "deployed", date: "Feb 17, 2026", cost: "$5" },
  { id: 2, title: "Update hero section headline", status: "deployed", date: "Feb 10, 2026", cost: "$5" },
  { id: 3, title: "Fix broken image on about page", status: "in-review", date: "Feb 20, 2026", cost: "$5" },
];

const statusColors: Record<string, string> = {
  deployed: "bg-green-500/10 text-green-600 border-green-500/20",
  "in-review": "bg-accent/10 text-accent border-accent/20",
  pending: "bg-muted text-muted-foreground border-border",
};

const Dashboard = () => {
  const [fixDescription, setFixDescription] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-lava flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display">LavaBowl</span>
            </Link>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Site
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display mb-8">Dashboard</h1>

          {/* Project Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Project</CardDescription>
                <CardTitle className="text-lg font-display">{mockProject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://${mockProject.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {mockProject.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Activity className="w-3.5 h-3.5" />
                  {mockProject.uptime} uptime
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Plan</CardDescription>
                <CardTitle className="text-lg font-display">{mockProject.plan}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last deployed: {mockProject.lastDeployed}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Request a Fix */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Wrench className="w-5 h-5 text-primary" />
                Request a Fix
              </CardTitle>
              <CardDescription>
                Describe the issue or change you need in plain language. $3 flat rate per fix (first 30 fixes).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., The contact form isn't sending emails anymore. When I submit it, nothing happens..."
                value={fixDescription}
                onChange={(e) => setFixDescription(e.target.value)}
                className="mb-4 min-h-[120px]"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Our AI engine will triage this and provide a preview before deploying.
                </p>
                <Button
                  className="gradient-lava border-0 text-white"
                  disabled={!fixDescription.trim()}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Submit Fix - $3
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fix History */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Fix History</CardTitle>
              <CardDescription>Your recent fix requests and their status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFixes.map((fix) => (
                  <div
                    key={fix.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      {fix.status === "deployed" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{fix.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{fix.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{fix.cost}</span>
                      <Badge variant="outline" className={statusColors[fix.status]}>
                        {fix.status === "deployed" ? "Deployed" : "In Review"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
