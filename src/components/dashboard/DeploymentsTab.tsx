import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, AlertCircle, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Deployment } from "@/types/api";
import { useRollback } from "@/hooks/use-deployments";
import { useToast } from "@/hooks/use-toast";

interface DeploymentsTabProps {
  deployments: Deployment[];
  isLoading: boolean;
}

const statusIcons: Record<string, React.ReactNode> = {
  ready: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  building: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  queued: <Clock className="w-4 h-4 text-muted-foreground" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  canceled: <AlertCircle className="w-4 h-4 text-muted-foreground" />,
};

const statusBg: Record<string, string> = {
  ready: "bg-green-500/10",
  building: "bg-blue-500/10",
  queued: "bg-muted",
  error: "bg-red-500/10",
  canceled: "bg-muted",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DeploymentsTab({ deployments, isLoading }: DeploymentsTabProps) {
  const rollback = useRollback();
  const { toast } = useToast();

  const handleRollback = async (deploymentId: string) => {
    try {
      await rollback.mutateAsync(deploymentId);
      toast({ title: "Rollback initiated", description: "A new deployment has been queued." });
    } catch (err) {
      toast({
        title: "Rollback failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Deployments</h1>
        <p className="text-sm text-muted-foreground">A history of all deployments to your live site.</p>
      </div>
      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No deployments yet.</p>
          ) : (
            deployments.map((dep, i) => (
              <div
                key={dep.id}
                className={`flex items-center justify-between p-4 ${
                  i < deployments.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      statusBg[dep.status] || "bg-muted"
                    }`}
                  >
                    {statusIcons[dep.status] || <Clock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {dep.commitMessage || dep.branch || "Deployment"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      {dep.commitHash && (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                          {dep.commitHash.slice(0, 7)}
                        </code>
                      )}
                      {formatDateTime(dep.createdAt)}
                    </p>
                  </div>
                </div>
                {dep.status === "ready" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleRollback(dep.id)}
                    disabled={rollback.isPending}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Rollback
                  </Button>
                )}
                {dep.url && (
                  <a href={dep.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                      View
                    </Button>
                  </a>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
