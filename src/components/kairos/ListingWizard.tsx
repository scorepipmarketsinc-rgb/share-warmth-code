import { ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ListingImageUploader } from "./ListingImageUploader";
import { DocumentUpload } from "./DocumentUpload";
import { createListing, ListingType } from "@/lib/listings";
import { useApp } from "@/lib/store";

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "tags";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  half?: boolean;
  min?: number;
  prefix?: string;
}

export interface DocDef {
  key: string;
  label: string;
  required?: boolean;
}

interface Props {
  type: ListingType;
  title: string;
  subtitle: string;
  fields: FieldDef[];
  docs: DocDef[];
  imageHint?: string;
  titleField?: string; // which field name is the listing title (defaults "title")
}

export function ListingWizard({
  type,
  title,
  subtitle,
  fields,
  docs,
  imageHint,
  titleField = "title",
}: Props) {
  const navigate = useNavigate();
  const { role } = useApp();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);
  const [docFiles, setDocFiles] = useState<
    Record<string, { name: string; url: string } | undefined>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ["Details", "Photos", "Documents", "Review"];

  const set = (k: string, v: any) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateDetails = () => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      if (f.required) {
        const v = data[f.name];
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0))
          e[f.name] = "Required";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePhotos = () => {
    if (images.length < 3) {
      toast.error("Add at least 3 photos");
      return false;
    }
    return true;
  };

  const validateDocs = () => {
    for (const d of docs) {
      if (d.required && !docFiles[d.key]) {
        toast.error(`${d.label} is required`);
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (step === 0 && !validateDetails()) return;
    if (step === 1 && !validatePhotos()) return;
    if (step === 2 && !validateDocs()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const listing = await createListing(type, {
        ownerId: "alex-mwangi",
        ownerName: "Alex Mwangi",
        title: data[titleField] || title,
        images,
        documents: docs
          .map((d) => docFiles[d.key])
          .filter(Boolean) as { name: string; url: string }[],
        data,
      });
      navigate(
        `/list/success?ref=${encodeURIComponent(listing.id)}&type=${type}`
      );
    } catch {
      toast.error("Could not submit listing. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewImg = images[0];
  const previewTitle = data[titleField] || `Untitled ${type}`;
  const previewLocation = [data.city, data.country].filter(Boolean).join(", ");
  const previewPrice = data.price || data.pricePerNight;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Create listing · {type}
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Step {step + 1} of {steps.length}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <div key={s} className="space-y-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                i <= step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {i < step ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">
                  {i + 1}
                </span>
              )}
              {s}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm md:p-7"
        >
          {step === 0 && (
            <DetailsStep
              fields={fields}
              data={data}
              errors={errors}
              onChange={set}
            />
          )}
          {step === 1 && (
            <ListingImageUploader
              value={images}
              onChange={setImages}
              hint={imageHint}
            />
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Required documents</h2>
              <p className="text-xs text-muted-foreground">
                Used for verification. Stored securely.
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {docs.map((d) => (
                  <DocumentUpload
                    key={d.key}
                    label={d.label}
                    required={d.required}
                    value={docFiles[d.key]}
                    onChange={(v) =>
                      setDocFiles((m) => ({ ...m, [d.key]: v }))
                    }
                  />
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <ReviewStep
              fields={fields}
              data={data}
              images={images}
              docs={docs.map((d) => ({ ...d, file: docFiles[d.key] }))}
            />
          )}

          <Separator className="my-6" />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prev}
              disabled={step === 0 || submitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>Submit for review</>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Live preview */}
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm">
            <div className="aspect-[4/3] bg-muted">
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Cover image preview
                </div>
              )}
            </div>
            <div className="p-4">
              <Badge className="mb-2 capitalize" variant="secondary">
                {type}
              </Badge>
              <h3 className="truncate font-display text-lg">{previewTitle}</h3>
              {previewLocation && (
                <p className="truncate text-xs text-muted-foreground">
                  {previewLocation}
                </p>
              )}
              {previewPrice && (
                <p className="mt-2 text-sm font-semibold">
                  ${Number(previewPrice).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                Your listing is <strong>not public</strong> until an admin
                approves it. You'll be notified within 24 hours.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailsStep({
  fields,
  data,
  errors,
  onChange,
}: {
  fields: FieldDef[];
  data: Record<string, any>;
  errors: Record<string, string>;
  onChange: (k: string, v: any) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Listing details</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.name}
            className={cn("space-y-1.5", !f.half && "sm:col-span-2")}
          >
            <Label className="text-xs font-medium">
              {f.label}{" "}
              {f.required && <span className="text-destructive">*</span>}
            </Label>
            <FieldInput field={f} value={data[f.name]} onChange={onChange} />
            {errors[f.name] && (
              <p className="text-[11px] text-destructive">{errors[f.name]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (k: string, v: any) => void;
}) {
  if (field.type === "textarea") {
    return (
      <Textarea
        value={value || ""}
        placeholder={field.placeholder}
        rows={4}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }
  if (field.type === "select") {
    return (
      <Select value={value || ""} onValueChange={(v) => onChange(field.name, v)}>
        <SelectTrigger>
          <SelectValue placeholder={field.placeholder || "Select…"} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "tags") {
    const list: string[] = Array.isArray(value) ? value : [];
    return (
      <div>
        <Input
          placeholder={field.placeholder || "Type and press Enter"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              onChange(field.name, [...list, v]);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
        {list.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {list.map((t, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  onChange(
                    field.name,
                    list.filter((_, idx) => idx !== i)
                  )
                }
              >
                {t} ×
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      placeholder={field.placeholder}
      value={value ?? ""}
      onChange={(e) =>
        onChange(
          field.name,
          field.type === "number" ? e.target.valueAsNumber : e.target.value
        )
      }
    />
  );
}

function ReviewStep({
  fields,
  data,
  images,
  docs,
}: {
  fields: FieldDef[];
  data: Record<string, any>;
  images: string[];
  docs: (DocDef & { file?: { name: string; url: string } })[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Review your listing</h2>
        <p className="text-xs text-muted-foreground">
          Once submitted, your listing enters admin review.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((f) => {
          const v = data[f.name];
          return (
            <div
              key={f.name}
              className="rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </div>
              <div className="text-sm">
                {Array.isArray(v) ? v.join(", ") : v || "—"}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Photos ({images.length})
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="aspect-square rounded-md object-cover"
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Documents
        </div>
        <ul className="space-y-1 text-sm">
          {docs.map((d) => (
            <li key={d.key} className="flex justify-between">
              <span>{d.label}</span>
              <span className="text-muted-foreground">
                {d.file ? d.file.name : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
