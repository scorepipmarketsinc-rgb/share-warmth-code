import { motion } from "framer-motion";
import { CheckCircle2, Printer } from "lucide-react";
import { Booking } from "@/lib/kairos-data";
import { Button } from "@/components/ui/button";

interface Props {
  booking: Booking;
  customerName?: string;
}

export function ReceiptCard({ booking, customerName = "Alex Mwangi" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="receipt-card rounded-2xl border border-border bg-card shadow-soft overflow-hidden max-w-md"
    >
      <div className="bg-gradient-ink text-primary-foreground px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Booking confirmed</span>
        </div>
        <div className="text-[10px] tracking-[0.16em] text-accent/80 uppercase">Receipt</div>
      </div>
      <div className="p-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg leading-tight">{booking.title}</div>
            <div className="text-xs text-muted-foreground">{booking.location}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Booking ID</div>
            <div className="font-mono text-xs">{booking.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Cell label="Customer" value={customerName} />
          <Cell label="Provider" value={booking.provider} />
          <Cell label="Category" value={booking.category} className="capitalize" />
          <Cell label="Status" value={booking.status} className="capitalize" />
          <Cell label="Dates" value={booking.date} />
          <Cell label="Nights" value={String(booking.nights)} />
        </div>

        <div className="border-t border-border pt-3 mt-2 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount paid</div>
            <div className="font-display text-2xl">${booking.total.toLocaleString()}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl no-print"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / PDF
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function Cell({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm ${className}`}>{value}</div>
    </div>
  );
}
