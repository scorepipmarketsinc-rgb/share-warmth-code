import { useRef, useState } from "react";
import { Upload, X, Star, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX = 20;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
}

export function ListingImageUploader({ value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX - value.length;
    if (remaining <= 0) {
      toast.error(`Max ${MAX} images`);
      return;
    }
    setBusy(true);
    const accepted: string[] = [];
    for (const f of Array.from(files).slice(0, remaining)) {
      if (!ACCEPT.includes(f.type)) {
        toast.error(`${f.name}: unsupported format`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name}: exceeds 5MB`);
        continue;
      }
      try {
        accepted.push(await fileToDataUrl(f));
      } catch {
        toast.error(`${f.name}: failed to read`);
      }
    }
    onChange([...value, ...accepted]);
    setBusy(false);
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const makeCover = (i: number) => {
    if (i === 0) return;
    const next = [...value];
    const [item] = next.splice(i, 1);
    next.unshift(item);
    onChange(next);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Listing photos</p>
                <p className="text-xs text-muted-foreground">
                  {value.length}/{MAX} · JPG, PNG, WEBP up to 5MB
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={busy || value.length >= MAX}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> Add photos
              </Button>
            </div>
            {hint && (
              <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
            )}
            {value.length < 3 && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600">
                <AlertCircle className="h-3 w-3" />
                Upload at least 3 clear images. Avoid screenshots or heavy filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((src, i) => (
            <div
              key={i}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border",
                i === 0 ? "border-primary ring-2 ring-primary/30" : "border-border"
              )}
            >
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {i === 0 && (
                <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  <Star className="h-2.5 w-2.5" /> Cover
                </div>
              )}
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(i)}
                      className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                    >
                      Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded-full bg-destructive p-1 text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
