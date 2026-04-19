import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ListServiceDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({ title: "", price: "", location: "", image: "", description: "" });

  const submit = () => {
    if (!form.title || !form.price || !form.location) {
      toast.error("Please fill in title, price and location.");
      return;
    }
    toast.success("Listing submitted for review", { description: `${form.title} · ${form.location}` });
    setForm({ title: "", price: "", location: "", image: "", description: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">List a service</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Luxury Suite in Juja" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price ($/night)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="300" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Juja, Kenya" />
            </div>
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes it special?" />
          </div>
          <Button onClick={submit} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90 rounded-xl shadow-gold">
            Publish listing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
