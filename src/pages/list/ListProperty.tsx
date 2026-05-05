import { ListingWizard, FieldDef, DocDef } from "@/components/kairos/ListingWizard";
import { useListingGuard, GuardLoader } from "./guard";

const fields: FieldDef[] = [
  { name: "title", label: "Listing title", type: "text", required: true, placeholder: "Modern 2BR apartment in Westlands" },
  {
    name: "propertyType",
    label: "Property type",
    type: "select",
    required: true,
    half: true,
    options: [
      { value: "apartment", label: "Apartment" },
      { value: "villa", label: "Villa" },
      { value: "house", label: "House" },
      { value: "land", label: "Land" },
      { value: "office", label: "Office" },
      { value: "townhouse", label: "Townhouse" },
      { value: "penthouse", label: "Penthouse" },
    ],
  },
  {
    name: "purpose",
    label: "Listing purpose",
    type: "select",
    required: true,
    half: true,
    options: [
      { value: "sale", label: "For sale" },
      { value: "rent", label: "For rent" },
      { value: "short_stay", label: "Short stay" },
    ],
  },
  { name: "country", label: "Country", type: "text", required: true, half: true, placeholder: "Kenya" },
  { name: "city", label: "City", type: "text", required: true, half: true, placeholder: "Nairobi" },
  { name: "neighborhood", label: "Neighborhood", type: "text", half: true, placeholder: "Westlands" },
  { name: "address", label: "Address", type: "text", half: true },
  { name: "price", label: "Price", type: "number", required: true, half: true, placeholder: "150000" },
  { name: "currency", label: "Currency", type: "select", half: true, options: [
    { value: "KES", label: "KES" },{ value: "USD", label: "USD" },{ value: "EUR", label: "EUR" }
  ]},
  { name: "bedrooms", label: "Bedrooms", type: "number", half: true },
  { name: "bathrooms", label: "Bathrooms", type: "number", half: true },
  { name: "size", label: "Size (sqm)", type: "number", half: true },
  { name: "amenities", label: "Amenities", type: "tags", placeholder: "Wifi, Pool, Parking…" },
  { name: "houseRules", label: "House rules", type: "textarea" },
  { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Tell guests what makes this place special" },
  { name: "videoUrl", label: "Video URL (optional)", type: "text" },
];

const docs: DocDef[] = [
  { key: "title_deed", label: "Title deed / Lease document", required: true },
  { key: "address_proof", label: "Proof of address (optional)" },
];

export default function ListProperty() {
  const ready = useListingGuard("property");
  if (!ready) return <GuardLoader />;
  return (
    <ListingWizard
      type="property"
      title="List your property"
      subtitle="Apartments, villas, houses, land, offices and more."
      fields={fields}
      docs={docs}
      imageHint="Include rooms, exterior, amenities and surroundings."
    />
  );
}
