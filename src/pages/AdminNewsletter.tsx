import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const SEED = [
  { id: "n1", email: "alex@kairos.ai", joined: "Mar 14, 2026", source: "footer" },
  { id: "n2", email: "joan@example.com", joined: "Mar 22, 2026", source: "checkout" },
  { id: "n3", email: "priya.shah@gmail.com", joined: "Apr 02, 2026", source: "footer" },
  { id: "n4", email: "host@marawild.com", joined: "Apr 09, 2026", source: "agent signup" },
  { id: "n5", email: "chef@atlas.io", joined: "Apr 18, 2026", source: "footer" },
  { id: "n6", email: "ops@noir.club", joined: "Apr 25, 2026", source: "concierge" },
];

export default function AdminNewsletter() {
  const [subs, setSubs] = useState(SEED);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const broadcast = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and message are required"); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    toast.success(`Broadcast sent to ${subs.length} subscribers`);
    setSubject(""); setBody("");
  };

  const remove = (id: string) => {
    setSubs((s) => s.filter((x) => x.id !== id));
    toast("Subscriber removed");
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-accent">
        <Mail className="w-3 h-3" /> Admin · Newsletter
      </div>
      <h1 className="font-display text-3xl md:text-4xl mt-1">Audience & broadcasts</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Subscribers</div>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-4xl mt-2 tabular-nums">{subs.length.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">+12% this month</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last broadcast</div>
          <div className="font-display text-2xl mt-2">Easter Escapes</div>
          <div className="text-xs text-muted-foreground mt-1">Sent Apr 18 · 64% open rate</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Footer signups (7d)</div>
          <div className="font-display text-2xl mt-2 tabular-nums">142</div>
          <div className="text-xs text-muted-foreground mt-1">via /api/newsletter/subscribe</div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2"><Send className="w-4 h-4 text-accent" /><h3 className="font-display text-lg">Send broadcast</h3></div>
          <div>
            <label className="text-xs text-muted-foreground">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="May curated escapes" className="mt-1 rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Message</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your update…" className="mt-1 rounded-xl min-h-[160px]" />
          </div>
          <Button onClick={broadcast} disabled={sending} className="w-full rounded-xl">
            {sending ? "Sending…" : `Send to ${subs.length} subscribers`}
          </Button>
        </motion.div>

        <div className="lg:col-span-3 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg">Subscribers</h3>
            <span className="text-xs text-muted-foreground">{subs.length} total</span>
          </div>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.joined}</TableCell>
                  <TableCell className="text-xs capitalize text-muted-foreground">{s.source}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(s.id)} className="h-8 w-8">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
