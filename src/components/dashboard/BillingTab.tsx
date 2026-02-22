import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { BillingStatus, Invoice } from "@/types/api";
import { useCreateCheckout, useCreatePortal } from "@/hooks/use-billing";
import { useToast } from "@/hooks/use-toast";

interface BillingTabProps {
  billingStatus: BillingStatus | undefined;
  invoices: Invoice[];
  isLoading: boolean;
  projectId: string;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function BillingTab({
  billingStatus,
  invoices,
  isLoading,
  projectId,
}: BillingTabProps) {
  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortal();
  const { toast } = useToast();

  const fixCount = billingStatus?.fixCount ?? 0;
  const promoRemaining = Math.max(0, 30 - fixCount);
  const hasActiveSubscription = billingStatus?.subscriptions?.some(
    (s) => s.status === "active" || s.status === "trialing"
  );

  const handleSubscribe = async () => {
    try {
      await createCheckout.mutateAsync({ projectId });
    } catch (err) {
      toast({
        title: "Failed to create checkout",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      await createPortal.mutateAsync();
    } catch (err) {
      toast({
        title: "Failed to open billing portal",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and payment methods.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Plan</span>
            <p className="text-2xl font-bold font-display mt-2">
              {hasActiveSubscription ? "Hosting" : "No Plan"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveSubscription ? "$5/month • Billed monthly" : "Subscribe to activate hosting"}
            </p>
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hosting</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Custom Domain</span>
                <span className="text-primary">Included</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">SSL Certificate</span>
                <span className="text-primary">Included</span>
              </div>
            </div>
            <div className="mt-4">
              {hasActiveSubscription ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs w-full"
                  onClick={handleManageBilling}
                  disabled={createPortal.isPending}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {createPortal.isPending ? "Opening..." : "Manage Billing"}
                </Button>
              ) : (
                <Button
                  className="gradient-lava border-0 text-white text-xs w-full"
                  size="sm"
                  onClick={handleSubscribe}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? "Redirecting..." : "Subscribe — $5/mo"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fix Credits</span>
            <p className="text-2xl font-bold font-display mt-2">
              {promoRemaining > 0 ? `${promoRemaining} remaining` : "Standard rate"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {fixCount} of 30 promo fixes used at $3/fix
            </p>
            <Progress value={(fixCount / 30) * 100} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {promoRemaining > 0
                ? `After promo, fixes are $5 each.`
                : `All fixes are now $5 each.`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">
                        {inv.description || inv.type}
                      </span>
                      <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatPrice(inv.amountInCents)}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        inv.status === "paid"
                          ? "text-green-600 bg-green-500/10 border-green-500/20"
                          : "text-muted-foreground"
                      }`}
                    >
                      {inv.status === "paid" ? "Paid" : inv.status}
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
