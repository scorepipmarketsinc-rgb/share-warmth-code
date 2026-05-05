import { ListingWizard, FieldDef, DocDef } from "@/components/kairos/ListingWizard";
import { useListingGuard, GuardLoader } from "./guard";

const fields: FieldDef[] = [
  { name: "title", label: "Experience title", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, half: true, options: [
    { value: "safari", label: "Safari" },{ value: "cultural", label: "Cultural" },{ value: "adventure", label: "Adventure" },
    { value: "nightlife", label: "Nightlife" },{ value: "food", label: "Food" },{ value: "wellness", label: "Wellness" },
    { value: "education", label: "Education" },
  ]},
  { name: "duration", label: "Duration", type: "text", half: true, placeholder: "e.g. 3 hours" },
  { name: "country", label: "Country", type: "text", required: true, half: true },
  { name: "city", label: "City", type: "text", required: true, half: true },
  { name: "meetingPoint", label: "Meeting point", type: "text", required: true },
  { name: "price", label: "Price per guest", type: "number", required: true, half: true },
  { name: "maxGuests", label: "Max guests", type: "number", half: true },
  { name: "language", label: "Language", type: "text", half: true, placeholder: "English" },
  { name: "hostName", label: "Host / guide name", type: "text", half: true },
  { name: "included", label: "What's included", type: "tags" },
  { name: "bring", label: "What guests should bring", type: "tags" },
  { name: "safety", label: "Safety notes", type: "textarea" },
  { name: "description", label: "Description", type: "textarea", required: true },
];

const docs: DocDef[] = [
  { key: "license", label: "License / certificate (optional)" },
];

export default function ListExperience() {
  const ready = useListingGuard("experience");
  if (!ready) return <GuardLoader />;
  return (
    <ListingWizard
      type="experience"
      title="List an experience"
      subtitle="Safaris, tours, adventures, food, wellness and more."
      fields={fields}
      docs={docs}
      imageHint="Use real activity photos that capture the experience."
    />
  );
}
