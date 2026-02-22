import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BillingStatus, Invoice, FixPriceInfo } from "@/types/api";

export function useBillingStatus() {
  return useQuery({
    queryKey: ["billing", "status"],
    queryFn: () => api.get<BillingStatus>("/billing/status"),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => api.get<Invoice[]>("/billing/invoices"),
  });
}

export function useFixPrice() {
  return useQuery({
    queryKey: ["billing", "fix-price"],
    queryFn: () => api.get<FixPriceInfo>("/billing/fix-price"),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (data: { projectId: string }) =>
      api.post<{ url: string }>("/billing/create-checkout", data),
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: () =>
      api.post<{ url: string }>("/billing/create-portal"),
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    },
  });
}
