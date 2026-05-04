import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Upload,
  Camera,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  IdCard,
  AlertCircle,
  RefreshCcw,
  Lock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import {
  getMyKyc,
  submitKyc,
  type KycStatus,
  type KycSubmission,
} from "@/lib/kyc";

const USER_ID = "alex-mwangi";

const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export default function Kyc() {
  const { role } = useApp();
  const [existing, setExisting] = useState<KycSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    kraPin: "",
    phone: "",
  });
  const [docs, setDocs] = useState<{
    idFront?: string;
    idBack?: string;
    selfie?: string;
  }>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const refresh = () =>
    getMyKyc(USER_ID).then((k) => {
      setExisting(k);
      setLoading(false);
    });

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("kyc:changed", h);
    return () => window.removeEventListener("kyc:changed", h);
  }, []);

  const handleFile = async (key: "idFront" | "idBack" | "selfie", file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    const url = await fileToDataUrl(file);
    setDocs((d) => ({ ...d, [key]: url }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 3) e.fullName = "Enter your full legal name";
    if (form.idNumber.trim().length < 5) e.idNumber = "Valid ID / passport required";
    if (!/^[A-Z]\d{9}[A-Z]$/i.test(form.kraPin.trim()))
      e.kraPin = "KRA PIN format: A123456789B";
    if (!/^\+?\d{9,15}$/.test(form.phone.trim())) e.phone = "Valid phone number required";
    if (!docs.idFront) e.idFront = "Upload front of ID";
    if (!docs.idBack) e.idBack = "Upload back of ID";
    if (!docs.selfie) e.selfie = "Upload a selfie";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const sub = await submitKyc({
        userId: USER_ID,
        userName: "Alex Mwangi",
        userEmail: "alex@kairos.ai",
        role: role as "client" | "agent" | "admin",
        ...form,
        idFront: docs.idFront!,
        idBack: docs.idBack!,
        selfie: docs.selfie!,
      });
      setExisting(sub);
      toast.success("KYC submitted", { description: "We'll review within 24 hours." });
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <Header existing={existing} role={role} />

      {existing && existing.status !== "rejected" ? (
        <StatusCard existing={existing} />
      ) : (
        <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm md:p-7">
            {existing?.status === "rejected" && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    Previous submission was rejected
                  </p>
                  {existing.notes && (
                    <p className="text-muted-foreground">Reviewer note: {existing.notes}</p>
                  )}
                </div>
              </div>
            )}

            <h2 className="text-base font-semibold">Personal information</h2>
            <p className="text-xs text-muted-foreground">
              Use the exact details that appear on your government-issued ID.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full legal name" error={errors.fullName}>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Alex Mwangi"
                />
              </Field>
              <Field label="ID / Passport number" error={errors.idNumber}>
                <Input
                  value={form.idNumber}
                  onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  placeholder="32145678"
                />
              </Field>
              <Field label="KRA PIN" error={errors.kraPin}>
                <Input
                  value={form.kraPin}
                  onChange={(e) =>
                    setForm({ ...form, kraPin: e.target.value.toUpperCase() })
                  }
                  placeholder="A123456789B"
                />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                />
              </Field>
            </div>

            <Separator className="my-6" />

            <h2 className="text-base font-semibold">Document uploads</h2>
            <p className="text-xs text-muted-foreground">
              Clear, well-lit photos. JPG or PNG, under 5MB.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <UploadTile
                label="ID front"
                icon={IdCard}
                value={docs.idFront}
                error={errors.idFront}
                onFile={(f) => handleFile("idFront", f)}
              />
              <UploadTile
                label="ID back"
                icon={IdCard}
                value={docs.idBack}
                error={errors.idBack}
                onFile={(f) => handleFile("idBack", f)}
              />
              <UploadTile
                label="Selfie"
                icon={Camera}
                value={docs.selfie}
                error={errors.selfie}
                onFile={(f) => handleFile("selfie", f)}
                capture
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="mt-6 w-full gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Submit for verification
                </>
              )}
            </Button>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Why we verify</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Protect guests, hosts and our community from fraud.</li>
                <li>• Required to list properties or receive payouts.</li>
                <li>• Documents are encrypted and never shared publicly.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Tips for a fast approval</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Make sure the four ID corners are visible.</li>
                <li>• Selfie: face camera, no sunglasses or hats.</li>
                <li>• Names must match across all documents.</li>
              </ul>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

function Header({ existing, role }: { existing: KycSubmission | null; role: string }) {
  const status: KycStatus = existing?.status ?? "unverified";
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> Identity verification
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Verify your identity
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {role === "agent"
            ? "Agents must complete KYC before listing services or receiving payouts."
            : "Unlock secure bookings, payouts, and host privileges across KAIROS."}
        </p>
      </div>
      <StatusBadge status={status} large />
    </div>
  );
}

function StatusCard({ existing }: { existing: KycSubmission }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          {existing.status === "approved" ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
              <Clock className="h-6 w-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {existing.status === "approved"
                ? "You're verified"
                : "Verification in review"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {existing.status === "approved"
                ? "You can now list services and receive payouts."
                : "Most reviews complete within 24 hours."}
            </p>
          </div>
        </div>

        <Separator className="my-5" />
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="Full name" value={existing.fullName} />
          <Detail label="ID number" value={existing.idNumber} />
          <Detail label="KRA PIN" value={existing.kraPin} />
          <Detail label="Phone" value={existing.phone} />
          <Detail
            label="Submitted"
            value={new Date(existing.submittedAt).toLocaleString()}
          />
          {existing.reviewedAt && (
            <Detail
              label="Reviewed"
              value={new Date(existing.reviewedAt).toLocaleString()}
            />
          )}
        </dl>

        {existing.notes && (
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
            <span className="font-medium">Reviewer note: </span>
            {existing.notes}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-6">
        <h3 className="text-sm font-semibold">Submitted documents</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "ID front", src: existing.idFront },
            { label: "ID back", src: existing.idBack },
            { label: "Selfie", src: existing.selfie },
          ].map((d) => (
            <div key={d.label}>
              <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border/60 bg-muted">
                <img src={d.src} alt={d.label} className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground">
                {d.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function UploadTile({
  label,
  icon: Icon,
  value,
  error,
  onFile,
  capture,
}: {
  label: string;
  icon: any;
  value?: string;
  error?: string;
  onFile: (f: File) => void;
  capture?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition ${
          error
            ? "border-destructive/60 bg-destructive/5"
            : "border-border/70 bg-muted/30 hover:border-primary/60 hover:bg-primary/5"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] text-white">
              <span>{label}</span>
              <span className="rounded bg-white/20 px-1.5 py-0.5">Replace</span>
            </div>
          </>
        ) : (
          <>
            <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            <span className="mt-2 text-xs font-medium">{label}</span>
            <span className="mt-1 text-[10px] text-muted-foreground">
              <Upload className="mr-0.5 inline h-3 w-3" /> Tap to upload
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={capture ? "user" : undefined}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] as File)}
      />
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export function StatusBadge({
  status,
  large,
}: {
  status: KycStatus;
  large?: boolean;
}) {
  const cfg: Record<KycStatus, { label: string; cls: string; Icon: any }> = {
    unverified: {
      label: "Unverified",
      cls: "bg-muted text-muted-foreground border-border",
      Icon: XCircle,
    },
    pending: {
      label: "Pending review",
      cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      Icon: Clock,
    },
    approved: {
      label: "Verified",
      cls: "bg-primary/15 text-primary border-primary/30",
      Icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      cls: "bg-destructive/15 text-destructive border-destructive/30",
      Icon: AlertCircle,
    },
  };
  const { label, cls, Icon } = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 ${
        large ? "py-1.5 text-sm" : "py-1 text-xs"
      } font-medium ${cls}`}
    >
      <Icon className={large ? "h-4 w-4" : "h-3 w-3"} />
      {label}
    </span>
  );
}
