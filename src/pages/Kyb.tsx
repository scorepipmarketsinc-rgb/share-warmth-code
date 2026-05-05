import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DocumentUpload } from "@/components/kairos/DocumentUpload";
import { getMyKyb, submitKyb, KybStatus, KybSubmission } from "@/lib/kyb";

const USER_ID = "alex-mwangi";

export default function Kyb() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<KybSubmission | null>(null);

  const [form, setForm] = useState({
    businessName: "",
    registrationNumber: "",
    taxNumber: "",
    email: "",
    phone: "",
    address: "",
  });
  const [docs, setDocs] = useState<
    Record<string, { name: string; url: string } | undefined>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getMyKyb(USER_ID).then((k) => {
      setExisting(k);
      setLoading(false);
      if (k?.status === "verified" && next) navigate(next, { replace: true });
    });
  }, [navigate, next]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.businessName.trim().length < 2) e.businessName = "Required";
    if (form.registrationNumber.trim().length < 3) e.registrationNumber = "Required";
    if (form.taxNumber.trim().length < 3) e.taxNumber = "Required";
    if (!/.+@.+\..+/.test(form.email)) e.email = "Valid email required";
    if (!/^\+?\d{9,15}$/.test(form.phone.trim())) e.phone = "Valid phone required";
    if (form.address.trim().length < 5) e.address = "Required";
    setErrors(e);
    if (!docs.cert) toast.error("Certificate of registration is required");
    if (!docs.permit) toast.error("Business permit is required");
    if (!docs.tax) toast.error("Tax document is required");
    if (!docs.directorId) toast.error("Director ID is required");
    return (
      Object.keys(e).length === 0 &&
      docs.cert && docs.permit && docs.tax && docs.directorId
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const sub = await submitKyb({
        userId: USER_ID,
        ...form,
        certificate: docs.cert!.url,
        permit: docs.permit!.url,
        taxDoc: docs.tax!.url,
        directorId: docs.directorId!.url,
      });
      setExisting(sub);
      toast.success("KYB submitted", { description: "Reviewed within 24 hours." });
    } catch {
      toast.error("Submission failed");
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Building className="h-3 w-3" /> Business verification
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Verify your business
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Required for hotels, travel packages, agents and businesses to
            list services and receive payouts.
          </p>
        </div>
        <KybBadge status={existing?.status ?? "not_started"} />
      </div>

      {existing && existing.status !== "rejected" ? (
        <StatusCard existing={existing} next={next} />
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm md:p-7">
            {existing?.status === "rejected" && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    Previous submission rejected
                  </p>
                  {existing.notes && (
                    <p className="text-muted-foreground">{existing.notes}</p>
                  )}
                </div>
              </div>
            )}
            <h2 className="text-base font-semibold">Business information</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Business name" error={errors.businessName}>
                <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </Field>
              <Field label="Registration number" error={errors.registrationNumber}>
                <Input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
              </Field>
              <Field label="KRA PIN / tax number" error={errors.taxNumber}>
                <Input value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Business email" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Business phone" error={errors.phone}>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Business address" error={errors.address}>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
            </div>

            <Separator className="my-6" />

            <h2 className="text-base font-semibold">Documents</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <DocumentUpload
                label="Certificate of registration"
                required
                value={docs.cert}
                onChange={(v) => setDocs((m) => ({ ...m, cert: v }))}
              />
              <DocumentUpload
                label="Business permit / license"
                required
                value={docs.permit}
                onChange={(v) => setDocs((m) => ({ ...m, permit: v }))}
              />
              <DocumentUpload
                label="Tax document"
                required
                value={docs.tax}
                onChange={(v) => setDocs((m) => ({ ...m, tax: v }))}
              />
              <DocumentUpload
                label="Director / owner ID"
                required
                value={docs.directorId}
                onChange={(v) => setDocs((m) => ({ ...m, directorId: v }))}
              />
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full gap-2">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Submit for verification</>
              )}
            </Button>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-5 text-xs text-muted-foreground">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Why KYB?</h3>
              <ul className="space-y-1.5">
                <li>• Verifies legitimate businesses on KAIROS.</li>
                <li>• Required to list hotels, tours and agency services.</li>
                <li>• Enables payouts to your business bank account.</li>
              </ul>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

function StatusCard({ existing, next }: { existing: KybSubmission; next: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {existing.status === "verified" ? "Business verified" : "Under review"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {existing.status === "verified"
              ? "You can now list services and receive payouts."
              : "Most reviews complete within 24 hours."}
          </p>
        </div>
      </div>
      {next && (
        <div className="mt-4 text-xs text-muted-foreground">
          You'll be redirected to <span className="font-mono">{next}</span> after approval.
        </div>
      )}
    </motion.div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function KybBadge({ status }: { status: KybStatus }) {
  const cfg: Record<KybStatus, { label: string; cls: string; Icon: any }> = {
    not_started: { label: "Not started", cls: "bg-muted text-muted-foreground border-border", Icon: XCircle },
    pending: { label: "Pending review", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30", Icon: Clock },
    verified: { label: "Verified", cls: "bg-primary/15 text-primary border-primary/30", Icon: CheckCircle2 },
    rejected: { label: "Rejected", cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: AlertCircle },
    needs_more_info: { label: "More info needed", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30", Icon: AlertCircle },
  };
  const { label, cls, Icon } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${cls}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}
