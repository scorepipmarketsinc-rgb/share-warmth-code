import { useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_SIZE = 8 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

const toDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

interface Doc {
  name: string;
  url: string;
}

interface Props {
  label: string;
  required?: boolean;
  value?: Doc;
  onChange: (d: Doc | undefined) => void;
}

export function DocumentUpload({ label, required, value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const handle = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: exceeds 8MB`);
      return;
    }
    const url = await toDataUrl(file);
    onChange({ name: file.name, url });
  };
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium">
            {label} {required && <span className="text-destructive">*</span>}
          </div>
          {value ? (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> {value.name}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground">
              PDF or image, up to 8MB
            </div>
          )}
        </div>
        {value ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange(undefined)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => ref.current?.click()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}
