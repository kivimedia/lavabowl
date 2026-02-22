import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Flame,
  Globe,
  Activity,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings,
  Shield,
  Server,
  RefreshCw,
  ArrowUpRight,
  Eye,
  ChevronRight,
  Zap,
  CalendarDays,
  DollarSign,
  HardDrive,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "framer-motion";

const mockProject = {
  name: "My Portfolio Site",
  url: "myportfolio.lavabowl.app",
  customDomain: "myportfolio.com",
  status: "online",
  uptime: "99.8%",
  lastDeployed: "Feb 18, 2026 at 3:42 PM",
  plan: "Hosting",
  monthlyBill: "$5/mo",
  fixesUsed: 7,
  fixesTotal: 30,
  storageUsed: 128,
  storageTotal: 1024,
  bandwidthUsed: 2.4,
  bandwidthTotal: 10,
};

const mockFixes = [
  { id: 1, title: "Fix contact form not sending emails", status: "deployed", date: "Feb 17, 2026", cost: "$3", description: "The contact form submit handler wasn't calling the API endpoint." },
  { id: 2, title: "Update hero section headline", status: "deployed", date: "Feb 10, 2026", cost: "$3", description: "Changed headline copy to match new branding." },
  { id: 3, title: "Fix broken image on about page", status: "in-review", date: "Feb 20, 2026", cost: "$3", description: "Image path was wrong after project migration." },
  { id: 4, title: "Add dark mode toggle", status: "pending", date: "Feb 22, 2026", cost: "Quoted", description: "Requires theme system implementation." },
];

const mockDeployments = [
  { id: 1, commit: "Fix contact form handler", hash: "a3f2c1d", date: "Feb 17, 2026 3:42 PM", status: "success" },
  { id: 2, commit: "Update hero headline copy", hash: "b7e4a2f", date: "Feb 10, 2026 11:15 AM", status: "success" },
  { id: 3, commit: "Initial migration deploy", hash: "c9d1e3a", date: "Feb 5, 2026 9:00 AM", status: "success" },
];

const statusColors: Record<string, string> = {
  deployed: "bg-green-500/10 text-green-600 border-green-500/20",
  "in-review": "bg-accent/10 text-accent border-accent/20",
  pending: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  deployed: "Deployed",
  "in-review": "In Review",
  pending: "Quoted",
};

const navItems = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "fixes", icon: Wrench, label: "Fixes" },
  { id: "deployments", icon: Server, label: "Deployments" },
  { id: "billing", icon: CreditCard, label: "Billing" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const Dashboard = () => {
  const [fixDescription, setFixDescription] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
            <span className="text-sm font-medium">{mockProject.name}</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
              <Wifi className="w-3 h-3 mr-1" /> Online
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <a href={`https://${mockProject.url}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" /> Visit Site
              </Button>
            </a>
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

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
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
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Uptime</span>
                      <Activity className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold font-display">{mockProject.uptime}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fixes Used</span>
                      <Wrench className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold font-display">{mockProject.fixesUsed}/{mockProject.fixesTotal}</p>
                    <Progress value={(mockProject.fixesUsed / mockProject.fixesTotal) * 100} className="mt-2 h-1.5" />
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bandwidth</span>
                      <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-2xl font-bold font-display">{mockProject.bandwidthUsed} GB</p>
                    <Progress value={(mockProject.bandwidthUsed / mockProject.bandwidthTotal) * 100} className="mt-2 h-1.5" />
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Storage</span>
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold font-display">{mockProject.storageUsed} MB</p>
                    <Progress value={(mockProject.storageUsed / mockProject.storageTotal) * 100} className="mt-2 h-1.5" />
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
                      Describe the issue or change. $3 flat rate per fix (first 30 fixes).
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
                        disabled={!fixDescription.trim()}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Submit Fix — $3
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Live URL</span>
                      <a href={`https://${mockProject.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                        {mockProject.url} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Custom Domain</span>
                      <span className="text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {mockProject.customDomain}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">SSL</span>
                      <span className="text-xs font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-500" /> Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Last Deploy</span>
                      <span className="text-xs font-medium">{mockProject.lastDeployed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Monthly</span>
                      <span className="text-xs font-bold">{mockProject.monthlyBill}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent fixes */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">Recent Fixes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveTab("fixes")}>
                      View all <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockFixes.slice(0, 3).map((fix) => (
                      <div key={fix.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-start gap-3">
                          {fix.status === "deployed" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          ) : fix.status === "in-review" ? (
                            <Eye className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{fix.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{fix.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium">{fix.cost}</span>
                          <Badge variant="outline" className={`text-xs ${statusColors[fix.status]}`}>
                            {statusLabels[fix.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* FIXES TAB */}
          {activeTab === "fixes" && (
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
                    <Button className="gradient-lava border-0 text-white text-sm" size="sm" disabled={!fixDescription.trim()}>
                      <Send className="w-3.5 h-3.5 mr-1" /> Submit Fix — $3
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Fix list */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">All Fixes</CardTitle>
                    <span className="text-xs text-muted-foreground">{mockProject.fixesUsed} of {mockProject.fixesTotal} promo fixes used</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockFixes.map((fix) => (
                      <div key={fix.id} className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3">
                            {fix.status === "deployed" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            ) : fix.status === "in-review" ? (
                              <Eye className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{fix.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{fix.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[fix.status]}`}>
                            {statusLabels[fix.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 ml-7 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> {fix.date}
                          </span>
                          <span className="text-xs font-medium flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {fix.cost}
                          </span>
                          {fix.status === "in-review" && (
                            <Button variant="outline" size="sm" className="text-xs h-7 ml-auto">
                              <Eye className="w-3 h-3 mr-1" /> Preview
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* DEPLOYMENTS TAB */}
          {activeTab === "deployments" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-display">Deployments</h1>
                <p className="text-sm text-muted-foreground">A history of all deployments to your live site.</p>
              </div>
              <Card className="border-border">
                <CardContent className="p-0">
                  {mockDeployments.map((dep, i) => (
                    <div key={dep.id} className={`flex items-center justify-between p-4 ${i < mockDeployments.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{dep.commit}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{dep.hash}</code>
                            {dep.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <RefreshCw className="w-3 h-3 mr-1" /> Rollback
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-display">Billing</h1>
                <p className="text-sm text-muted-foreground">Manage your plan and payment methods.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardContent className="p-5">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Plan</span>
                    <p className="text-2xl font-bold font-display mt-2">Hosting</p>
                    <p className="text-sm text-muted-foreground mt-1">$5/month • Billed monthly</p>
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
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-5">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fix Credits</span>
                    <p className="text-2xl font-bold font-display mt-2">{mockProject.fixesTotal - mockProject.fixesUsed} remaining</p>
                    <p className="text-sm text-muted-foreground mt-1">{mockProject.fixesUsed} of {mockProject.fixesTotal} promo fixes used at $3/fix</p>
                    <Progress value={(mockProject.fixesUsed / mockProject.fixesTotal) * 100} className="mt-4 h-2" />
                    <p className="text-xs text-muted-foreground mt-2">After promo, fixes are individually quoted.</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { period: "February 2026", amount: "$5.00", status: "Upcoming" },
                      { period: "January 2026", amount: "$14.00", status: "Paid" },
                      { period: "December 2025", amount: "$8.00", status: "Paid" },
                    ].map((inv) => (
                      <div key={inv.period} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{inv.period}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{inv.amount}</span>
                          <Badge variant="outline" className={`text-xs ${inv.status === "Paid" ? "text-green-600 bg-green-500/10 border-green-500/20" : "text-muted-foreground"}`}>
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
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
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{mockProject.url}</p>
                        <p className="text-xs text-muted-foreground">Default subdomain</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-green-600 bg-green-500/10 border-green-500/20">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{mockProject.customDomain}</p>
                        <p className="text-xs text-muted-foreground">Custom domain • DNS verified</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-green-600 bg-green-500/10 border-green-500/20">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Supabase Connection</CardTitle>
                  <CardDescription className="text-xs">Your database connection status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Connected</p>
                        <p className="text-xs text-muted-foreground">abcdefgh.supabase.co</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">Update Credentials</Button>
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
                  <Button variant="destructive" size="sm" className="text-xs">Delete Project</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
