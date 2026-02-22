import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
  Send,
  CheckCircle2,
  Eye,
  Clock,
  CalendarDays,
  DollarSign,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import type { FixRequest } from "@/types/api";
import { useSubmitFix, useApproveFix, useRejectFix } from "@/hooks/use-fixes";
import { useToast } from "@/hooks/use-toast";

interface FixesTabProps {
  projectId: string;
  fixes: FixRequest[];
  isLoading: boolean;
  fixCount: number;
  currentFixPrice: number;
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

export default function FixesTab({
  projectId,
  fixes,
  isLoading,
  fixCount,
  currentFixPrice,
}: FixesTabProps) {
  const [fixDescription, setFixDescription] = useState("");
  const submitFix = useSubmitFix();
  const approveFix = useApproveFix();
  const rejectFix = useRejectFix();
  const { toast } = useToast();

  const handleSubmitFix = async () => {
    if (!fixDescription.trim()) return;
    try {
      await submitFix.mutateAsync({ projectId, description: fixDescription });
      setFixDescription("");
      toast({
        title: "Fix submitted!",
        description: "We'll triage your request shortly.",
      });
    } catch (err) {
      toast({
        title: "Failed to submit fix",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (fixId: string) => {
    try {
      await approveFix.mutateAsync(fixId);
      toast({ title: "Fix approved!", description: "Deploying to production now." });
    } catch (err) {
      toast({
        title: "Failed to approve",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (fixId: string) => {
    try {
      await rejectFix.mutateAsync(fixId);
      toast({ title: "Fix rejected", description: "The preview has been discarded." });
    } catch (err) {
      toast({
        title: "Failed to reject",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const promoRemaining = Math.max(0, 30 - fixCount);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Fixes</h1>
        <p className="text-sm text-muted-foreground">Track all your fix requests and their status.</p>
      </div>

      {/* Request fix */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Wrench className="w-4 h-4 text-primary" /> New Fix Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe the issue or change you need..."
            value={fixDescription}
            onChange={(e) => setFixDescription(e.target.value)}
            className="mb-3 min-h-[100px] text-sm"
          />
          <div className="flex justify-end">
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

      {/* Fix list */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base">All Fixes</CardTitle>
            {promoRemaining > 0 && (
              <span className="text-xs text-muted-foreground">
                {fixCount} of 30 promo fixes used
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : fixes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No fixes yet. Submit your first one above!
            </p>
          ) : (
            <div className="space-y-3">
              {fixes.map((fix) => (
                <div
                  key={fix.id}
                  className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      {fix.status === "deployed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      ) : fix.status === "preview_ready" || fix.status === "approved" ? (
                        <Eye className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{fix.description}</p>
                        {fix.errorLog && (
                          <p className="text-xs text-red-500 mt-1">{fix.errorLog}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[fix.status] || ""}`}>
                      {statusLabels[fix.status] || fix.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 ml-7 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {formatDate(fix.createdAt)}
                    </span>
                    {fix.priceInCents && (
                      <span className="text-xs font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {formatPrice(fix.priceInCents)}
                      </span>
                    )}
                    {fix.status === "preview_ready" && (
                      <div className="flex items-center gap-2 ml-auto">
                        {fix.previewUrl && (
                          <a href={fix.previewUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              <Eye className="w-3 h-3 mr-1" /> Preview
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 text-green-600 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => handleApprove(fix.id)}
                          disabled={approveFix.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 text-red-600 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => handleReject(fix.id)}
                          disabled={rejectFix.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
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
