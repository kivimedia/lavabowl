import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Wrench,
  Zap,
  HardDrive,
  Send,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Project, FixRequest, ProjectStats } from "@/types/api";
import { useState } from "react";
import { useSubmitFix } from "@/hooks/use-fixes";
import { useToast } from "@/hooks/use-toast";

interface OverviewTabProps {
  project: Project;
  stats: ProjectStats | undefined;
  fixes: FixRequest[];
  fixCount: number;
  currentFixPrice: number;
  onNavigateToFixes: () => void;
}

const statusColors: Record<string, string> = {
  deployed: "bg-green-500/10 text-green-600 border-green-500/20",
  preview_ready: "bg-accent/10 text-accent border-accent/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  submitted: "bg-muted text-muted-foreground border-border",
  triaging: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  quoted: "bg-muted text-muted-foreground border-border",
  awaiting_payment: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  deploying: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  deployed: "Deployed",
  preview_ready: "Preview Ready",
  approved: "Approved",
  in_progress: "In Progress",
  submitted: "Submitted",
  triaging: "Triaging",
  quoted: "Quoted",
  awaiting_payment: "Awaiting Payment",
  deploying: "Deploying",
  failed: "Failed",
  rejected: "Rejected",
  refunded: "Refunded",
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OverviewTab({
  project,
  stats,
  fixes,
  fixCount,
  currentFixPrice,
  onNavigateToFixes,
}: OverviewTabProps) {
  const [fixDescription, setFixDescription] = useState("");
  const submitFix = useSubmitFix();
  const { toast } = useToast();

  const handleSubmitFix = async () => {
    if (!fixDescription.trim()) return;
    try {
      await submitFix.mutateAsync({
        projectId: project.id,
        description: fixDescription,
      });
      setFixDescription("");
      toast({
        title: "Fix submitted!",
        description: "We'll triage your request and get back to you shortly.",
      });
    } catch (err) {
      toast({
        title: "Failed to submit fix",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const recentFixes = fixes.slice(0, 3);
  const completedFixes = stats?.completedFixes ?? 0;
  const totalFixes = stats?.totalFixes ?? 0;
  const liveUrl =
    project.customDomain || (project.subdomain ? `${project.subdomain}.lavabowl.app` : project.vercelDeploymentUrl);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's how your project is doing.</p>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold font-display capitalize">{project.status}</p>
            <p className="text-xs text-muted-foreground mt-1">Project health</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Fixes</span>
              <Wrench className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display">
              {completedFixes}/{totalFixes}
            </p>
            <Progress value={totalFixes > 0 ? (completedFixes / totalFixes) * 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fix Price</span>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold font-display">{formatPrice(currentFixPrice)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {fixCount < 30 ? `${30 - fixCount} fixes left at $3` : "Standard rate"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Deployments</span>
              <HardDrive className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-display">{stats?.totalDeployments ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats?.successfulDeployments ?? 0} successful</p>
          </CardContent>
        </Card>
      </div>

      {/* Two-col layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quick fix request */}
        <Card className="lg:col-span-3 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Wrench className="w-4 h-4 text-primary" />
              Request a Fix
            </CardTitle>
            <CardDescription className="text-xs">
              Describe the issue or change. {formatPrice(currentFixPrice)} per fix
              {fixCount < 30 ? ` (${30 - fixCount} promo fixes remaining)` : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., The contact form isn't sending emails when I click submit..."
              value={fixDescription}
              onChange={(e) => setFixDescription(e.target.value)}
              className="mb-3 min-h-[100px] text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">AI-powered • Preview before deploy</p>
              <Button
                className="gradient-lava border-0 text-white text-sm"
                size="sm"
                disabled={!fixDescription.trim() || submitFix.isPending}
                onClick={handleSubmitFix}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                {submitFix.isPending ? "Submitting..." : `Submit Fix — ${formatPrice(currentFixPrice)}`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project info card */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveUrl && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Live URL</span>
                <a
                  href={`https://${liveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {liveUrl} <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            )}
            {project.customDomain && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Custom Domain</span>
                <span className="text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> {project.customDomain}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">SSL</span>
              <span className="text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created</span>
              <span className="text-xs font-medium">{formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Monthly</span>
              <span className="text-xs font-bold">$5/mo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent fixes */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base">Recent Fixes</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onNavigateToFixes}>
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentFixes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No fixes yet. Submit your first fix above!</p>
          ) : (
            <div className="space-y-3">
              {recentFixes.map((fix) => (
                <div
                  key={fix.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {fix.status === "deployed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    ) : fix.status === "preview_ready" || fix.status === "approved" ? (
                      <Eye className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{fix.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(fix.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {fix.priceInCents && <span className="text-xs font-medium">{formatPrice(fix.priceInCents)}</span>}
                    <Badge variant="outline" className={`text-xs ${statusColors[fix.status] || ""}`}>
                      {statusLabels[fix.status] || fix.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
