import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  ExternalLink,
  LayoutDashboard,
  Wrench,
  Server,
  CreditCard,
  Settings,
  ChevronRight,
  Wifi,
  WifiOff,
  Clock,
  Loader2,
} from "lucide-react";

// Hooks
import { useProjects, useProjectStats } from "@/hooks/use-projects";
import { useFixes } from "@/hooks/use-fixes";
import { useDeployments } from "@/hooks/use-deployments";
import { useBillingStatus, useInvoices, useFixPrice } from "@/hooks/use-billing";

// Dashboard sub-components
import ProjectSelector from "@/components/dashboard/ProjectSelector";
import OverviewTab from "@/components/dashboard/OverviewTab";
import FixesTab from "@/components/dashboard/FixesTab";
import DeploymentsTab from "@/components/dashboard/DeploymentsTab";
import BillingTab from "@/components/dashboard/BillingTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

import type { Project } from "@/types/api";

const navItems = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "fixes", icon: Wrench, label: "Fixes" },
  { id: "deployments", icon: Server, label: "Deployments" },
  { id: "billing", icon: CreditCard, label: "Billing" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  active: {
    icon: <Wifi className="w-3 h-3 mr-1" />,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    label: "Online",
  },
  migrating: {
    icon: <Clock className="w-3 h-3 mr-1" />,
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    label: "Migrating",
  },
  onboarding: {
    icon: <Clock className="w-3 h-3 mr-1" />,
    color: "bg-muted text-muted-foreground border-border",
    label: "Setting Up",
  },
  suspended: {
    icon: <WifiOff className="w-3 h-3 mr-1" />,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    label: "Suspended",
  },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch all user projects
  const { data: projects, isLoading: projectsLoading } = useProjects();

  // When user has projects but hasn't selected one, auto-select the first active or first project
  const currentProject = selectedProject || projects?.find((p) => p.status === "active") || projects?.[0] || null;
  const projectId = currentProject?.id;

  // Fetch data for the selected project
  const { data: stats } = useProjectStats(projectId);
  const { data: fixes, isLoading: fixesLoading } = useFixes(projectId);
  const { data: deployments, isLoading: deploymentsLoading } = useDeployments(projectId);
  const { data: billingStatus, isLoading: billingLoading } = useBillingStatus();
  const { data: invoices } = useInvoices();
  const { data: fixPrice } = useFixPrice();

  const fixCount = billingStatus?.fixCount ?? 0;
  const currentFixPrice = fixPrice?.priceInCents ?? 300;

  // Show project selector if user has no projects or wants to switch
  if (!projectsLoading && (!projects || projects.length === 0)) {
    return (
      <ProjectSelector
        projects={[]}
        isLoading={false}
        onSelect={setSelectedProject}
      />
    );
  }

  // Still loading
  if (projectsLoading || !currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const config = statusConfig[currentProject.status] || statusConfig.pending;
  const liveUrl =
    currentProject.customDomain ||
    (currentProject.subdomain ? `${currentProject.subdomain}.lavabowl.app` : currentProject.vercelDeploymentUrl);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-lava flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-display">LavaBowl</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {projects && projects.length > 1 ? (
              <select
                value={currentProject.id}
                onChange={(e) => {
                  const p = projects.find((pr) => pr.id === e.target.value);
                  if (p) setSelectedProject(p);
                }}
                className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium">{currentProject.name}</span>
            )}
            <Badge variant="outline" className={`text-xs ${config.color}`}>
              {config.icon} {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {liveUrl && (
              <a href={`https://${liveUrl}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Site
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card/30 p-3 hidden md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl">
          {/* Mobile nav */}
          <div className="flex gap-2 mb-6 overflow-x-auto md:hidden pb-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground bg-muted/30"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab
              project={currentProject}
              stats={stats}
              fixes={fixes ?? []}
              fixCount={fixCount}
              currentFixPrice={currentFixPrice}
              onNavigateToFixes={() => setActiveTab("fixes")}
            />
          )}

          {activeTab === "fixes" && (
            <FixesTab
              projectId={currentProject.id}
              fixes={fixes ?? []}
              isLoading={fixesLoading}
              fixCount={fixCount}
              currentFixPrice={currentFixPrice}
            />
          )}

          {activeTab === "deployments" && (
            <DeploymentsTab
              deployments={deployments ?? []}
              isLoading={deploymentsLoading}
            />
          )}

          {activeTab === "billing" && (
            <BillingTab
              billingStatus={billingStatus}
              invoices={invoices ?? []}
              isLoading={billingLoading}
              projectId={currentProject.id}
            />
          )}

          {activeTab === "settings" && <SettingsTab project={currentProject} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
