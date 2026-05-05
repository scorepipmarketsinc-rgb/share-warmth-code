import { ListingWizard, FieldDef, DocDef } from "@/components/kairos/ListingWizard";
import { useListingGuard, GuardLoader } from "./guard";

const fields: FieldDef[] = [
  { name: "title", label: "Service name", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, half: true, options: [
    { value: "beauty", label: "Beauty" },{ value: "fitness", label: "Fitness" },{ value: "coaching", label: "Coaching" },
    { value: "photography", label: "Photography" },{ value: "events", label: "Events" },{ value: "transport", label: "Transport" },
    { value: "cleaning", label: "Cleaning" },{ value: "repair", label: "Repair" },{ value: "wellness", label: "Wellness" },
  ]},
  { name: "providerType", label: "Provider type", type: "select", required: true, half: true, options: [
    { value: "individual", label: "Individual" },{ value: "business", label: "Business" }
  ]},
  { name: "country", label: "Country", type: "text", required: true, half: true },
  { name: "city", label: "City", type: "text", required: true, half: true },
  { name: "serviceArea", label: "Service area", type: "text" },
  { name: "price", label: "Price", type: "number", required: true, half: true },
  { name: "pricingType", label: "Pricing type", type: "select", half: true, options: [
    { value: "fixed", label: "Fixed" },{ value: "hourly", label: "Hourly" },{ value: "negotiable", label: "Negotiable" }
  ]},
  { name: "duration", label: "Typical duration", type: "text", half: true },
  { name: "requirements", label: "Requirements", type: "textarea" },
  { name: "description", label: "Description", type: "textarea", required: true },
];

const docs: DocDef[] = [
  { key: "license", label: "License / certificate (if applicable)" },
];

export default function ListLifestyle() {
  const ready = useListingGuard("lifestyle");
  if (!ready) return <GuardLoader />;
  return (
    <ListingWizard
      type="lifestyle"
      title="List a lifestyle service"
      subtitle="Beauty, fitness, photography, events, and more."
      fields={fields}
      docs={docs}
      imageHint="Show your work, your space, and your team."
    />
  );
}
