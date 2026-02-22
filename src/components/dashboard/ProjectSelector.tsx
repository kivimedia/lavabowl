import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Plus, Wifi, WifiOff, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/types/api";

interface ProjectSelectorProps {
  projects: Project[];
  isLoading: boolean;
  onSelect: (project: Project) => void;
}

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

export default function ProjectSelector({ projects, isLoading, onSelect }: ProjectSelectorProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between h-14 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-lava flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-display">LavaBowl</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-display">Your Projects</h1>
            <p className="text-muted-foreground mt-2">
              {projects.length > 0
                ? "Select a project to manage, or create a new one."
                : "Get started by migrating your first Lovable project."}
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full gradient-lava flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold font-display mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Migrate your first Lovable project to get started with affordable hosting and AI-powered fixes.
              </p>
              <Link to="/get-started">
                <Button className="gradient-lava border-0 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Start Migration
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {projects.map((project) => {
                  const config = statusConfig[project.status] || statusConfig.pending;
                  const url =
                    project.customDomain ||
                    (project.subdomain ? `${project.subdomain}.lavabowl.app` : null);

                  return (
                    <Card
                      key={project.id}
                      className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                      onClick={() => onSelect(project)}
                    >
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl gradient-lava flex items-center justify-center">
                            <Flame className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold font-display">{project.name}</h3>
                            {url && <p className="text-xs text-muted-foreground">{url}</p>}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          {config.icon} {config.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="text-center">
                <Link to="/get-started">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> Add Another Project
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
