import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase handles the token exchange automatically from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login", { replace: true });
          return;
        }

        if (session?.user) {
          // Register user in our database (idempotent - will succeed even if user exists)
          try {
            await api.post("/auth/register", {
              supabaseUserId: session.user.id,
              email: session.user.email,
              fullName:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                null,
            });
          } catch {
            // User might already exist - that's fine
          }

          // Check if user has any projects
          try {
            const projects = await api.get<{ length: number }>("/projects");
            if (Array.isArray(projects) && projects.length > 0) {
              navigate("/dashboard", { replace: true });
            } else {
              navigate("/get-started", { replace: true });
            }
          } catch {
            navigate("/get-started", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
