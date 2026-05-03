import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { Role } from "@/lib/kairos-data";
import { toast } from "sonner";
import kairosLogo from "@/assets/kairos-logo.png";

const roleRedirect: Record<Role, string> = {
  admin: "/admin",
  agent: "/agent",
  client: "/dashboard",
};

// Simple email→role map for the mock backend
const roleFromEmail = (email: string): Role => {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("agent") || e.includes("host")) return "agent";
  return "client";
};

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { setRole } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      // Mock POST /api/auth/login | /api/auth/register
      await new Promise((r) => setTimeout(r, 800));
      const role = roleFromEmail(email);
      setRole(role);
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      navigate(roleRedirect[role], { replace: true });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-foreground/10 blur-3xl" />
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-ink text-background">
        <Link to="/" className="flex items-center gap-2">
          <img src={kairosLogo} alt="KAIROS" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-display text-base leading-none">KAIROS</div>
            <div className="text-[10px] tracking-[0.18em] opacity-70">AI · CONCIERGE</div>
          </div>
        </Link>
        <div className="space-y-4">
          <Sparkles className="w-6 h-6 text-accent" />
          <h2 className="font-display text-4xl leading-tight max-w-md">A concierge that books, not just chats.</h2>
          <p className="text-sm opacity-70 max-w-md">Find stays, plan tours, secure events — all from one calm conversation.</p>
        </div>
        <div className="text-xs opacity-60">© KAIROS · 2026</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="w-full max-w-sm space-y-5"
        >
          <div className="lg:hidden flex items-center gap-2">
            <img src={kairosLogo} alt="" className="w-8 h-8" />
            <span className="font-display">KAIROS</span>
          </div>
          <div>
            <h1 className="font-display text-3xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Sign in to continue your conversation." : "Join Kairos and unlock the concierge."}
            </p>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Mwangi" className="mt-1 rounded-xl" />
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@kairos.ai" className="mt-1 rounded-xl" />
            <p className="text-[10px] text-muted-foreground mt-1">Tip: emails containing "admin" or "agent" route to those dashboards.</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <div className="relative mt-1">
              <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl pr-10" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {mode === "login" ? "Signing in…" : "Creating account…"}</> : mode === "login" ? "Sign in" : "Create account"}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            {mode === "login" ? (<>New here? <Link to="/register" className="text-accent hover:underline">Create an account</Link></>) :
              (<>Already a member? <Link to="/login" className="text-accent hover:underline">Sign in</Link></>)}
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export const Login = () => <AuthPage mode="login" />;
export const Register = () => <AuthPage mode="register" />;
