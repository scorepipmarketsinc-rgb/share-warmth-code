import { ListingWizard, FieldDef, DocDef } from "@/components/kairos/ListingWizard";
import { useListingGuard, GuardLoader } from "./guard";

const fields: FieldDef[] = [
  { name: "title", label: "Package title", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, half: true, options: [
    { value: "tour", label: "Tour" },{ value: "safari", label: "Safari" },{ value: "honeymoon", label: "Honeymoon" },
    { value: "group", label: "Group trip" },{ value: "cultural", label: "Cultural trip" },{ value: "business", label: "Business trip" }
  ]},
  { name: "departureCity", label: "Departure city", type: "text", required: true, half: true },
  { name: "destinations", label: "Destinations", type: "tags", required: true },
  { name: "days", label: "Number of days", type: "number", required: true, half: true },
  { name: "nights", label: "Number of nights", type: "number", required: true, half: true },
  { name: "price", label: "Price per traveler", type: "number", required: true, half: true },
  { name: "currency", label: "Currency", type: "select", half: true, options: [
    { value: "USD", label: "USD" },{ value: "KES", label: "KES" },{ value: "EUR", label: "EUR" }
  ]},
  { name: "maxTravelers", label: "Max travelers", type: "number", half: true },
  { name: "availableDates", label: "Available dates", type: "tags", placeholder: "2026-06-01" },
  { name: "itinerary", label: "Itinerary (day by day)", type: "textarea", required: true },
  { name: "inclusions", label: "Inclusions", type: "tags" },
  { name: "exclusions", label: "Exclusions", type: "tags" },
  { name: "transport", label: "Transport details", type: "textarea" },
  { name: "accommodation", label: "Accommodation details", type: "textarea" },
  { name: "cancellationPolicy", label: "Cancellation policy", type: "textarea" },
  { name: "description", label: "Description", type: "textarea", required: true },
  // city/country used in preview
  { name: "city", label: "Featured city", type: "text", half: true },
  { name: "country", label: "Featured country", type: "text", half: true },
];

const docs: DocDef[] = [
  { key: "operator_license", label: "Tour operator license / business doc", required: true },
];

export default function ListTravel() {
  const ready = useListingGuard("travel");
  if (!ready) return <GuardLoader />;
  return (
    <ListingWizard
      type="travel"
      title="List a travel package"
      subtitle="Multi-day tours, honeymoons, safaris and group trips."
      fields={fields}
      docs={docs}
      imageHint="Use destination shots, accommodations and activity highlights."
    />
  );
}
