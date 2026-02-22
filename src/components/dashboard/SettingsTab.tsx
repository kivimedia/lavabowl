import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/types/api";
import { useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SettingsTabProps {
  project: Project;
}

export default function SettingsTab({ project }: SettingsTabProps) {
  const [customDomain, setCustomDomain] = useState(project.customDomain || "");
  const [supabaseUrl, setSupabaseUrl] = useState(project.supabaseUrl || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(project.supabaseAnonKey || "");
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const navigate = useNavigate();

  const subdomain = project.subdomain
    ? `${project.subdomain}.lavabowl.app`
    : null;

  const handleSaveDomain = async () => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { customDomain: customDomain || undefined },
      });
      toast({ title: "Domain updated" });
    } catch (err) {
      toast({
        title: "Failed to update domain",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleSaveSupabase = async () => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          supabaseUrl: supabaseUrl || undefined,
          supabaseAnonKey: supabaseAnonKey || undefined,
        },
      });
      toast({ title: "Supabase credentials updated" });
    } catch (err) {
      toast({
        title: "Failed to update credentials",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently remove your project.")) return;
    try {
      await deleteProject.mutateAsync(project.id);
      toast({ title: "Project deleted" });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Failed to delete project",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your project configuration.</p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Domain & DNS</CardTitle>
          <CardDescription className="text-xs">Manage your domain settings and DNS records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subdomain && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{subdomain}</p>
                  <p className="text-xs text-muted-foreground">Default subdomain</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-green-600 bg-green-500/10 border-green-500/20">
                Active
              </Badge>
            </div>
          )}
          {project.customDomain && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{project.customDomain}</p>
                  <p className="text-xs text-muted-foreground">Custom domain</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-green-600 bg-green-500/10 border-green-500/20">
                Active
              </Badge>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="custom-domain" className="text-xs">Custom Domain</Label>
            <div className="flex gap-2">
              <Input
                id="custom-domain"
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDomain}
                disabled={updateProject.isPending}
              >
                {updateProject.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Supabase Connection</CardTitle>
          <CardDescription className="text-xs">Your database connection credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                {project.supabaseUrl ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {project.supabaseUrl ? "Connected" : "Not Connected"}
                </p>
                {project.supabaseUrl && (
                  <p className="text-xs text-muted-foreground">{project.supabaseUrl}</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="supa-url" className="text-xs">Supabase URL</Label>
              <Input
                id="supa-url"
                placeholder="https://abcdefgh.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="supa-key" className="text-xs">Anon Key</Label>
              <Input
                id="supa-key"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleSaveSupabase}
              disabled={updateProject.isPending}
            >
              {updateProject.isPending ? "Saving..." : "Update Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Project</p>
            <p className="text-xs text-muted-foreground">Permanently remove your project and all data.</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting..." : "Delete Project"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
