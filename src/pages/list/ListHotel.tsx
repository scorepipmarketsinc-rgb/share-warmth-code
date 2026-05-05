import { ListingWizard, FieldDef, DocDef } from "@/components/kairos/ListingWizard";
import { useListingGuard, GuardLoader } from "./guard";

const fields: FieldDef[] = [
  { name: "hotelName", label: "Hotel name", type: "text", required: true },
  { name: "title", label: "Room name / type", type: "text", required: true, placeholder: "Deluxe Suite" },
  { name: "country", label: "Country", type: "text", required: true, half: true },
  { name: "city", label: "City", type: "text", required: true, half: true },
  { name: "address", label: "Address", type: "text" },
  { name: "price", label: "Price per night", type: "number", required: true, half: true },
  { name: "availableRooms", label: "Available rooms", type: "number", half: true },
  { name: "maxGuests", label: "Max guests", type: "number", half: true },
  { name: "beds", label: "Beds", type: "number", half: true },
  { name: "bathrooms", label: "Bathrooms", type: "number", half: true },
  { name: "checkIn", label: "Check-in time", type: "text", half: true, placeholder: "14:00" },
  { name: "checkOut", label: "Check-out time", type: "text", half: true, placeholder: "11:00" },
  { name: "amenities", label: "Amenities", type: "tags" },
  { name: "cancellationPolicy", label: "Cancellation policy", type: "textarea" },
  { name: "description", label: "Description", type: "textarea", required: true },
];

const docs: DocDef[] = [
  { key: "license", label: "Hotel license / business permit", required: true },
];

export default function ListHotel() {
  const ready = useListingGuard("hotel");
  if (!ready) return <GuardLoader />;
  return (
    <ListingWizard
      type="hotel"
      title="List your hotel or room"
      subtitle="Add rooms, suites, or boutique stays for travelers worldwide."
      fields={fields}
      docs={docs}
      imageHint="Show rooms, lobby, dining, exterior and amenities."
    />
  );
}
