import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { getMyKyc } from "@/lib/kyc";
import { getMyKyb } from "@/lib/kyb";
import { ListingType, TYPE_META } from "@/lib/listings";

const USER_ID = "alex-mwangi";

/**
 * Wraps a listing route to enforce auth + KYC/KYB gating.
 * - Always required: a logged-in user (mocked via role !== unset)
 * - For agents/admins → KYB
 * - For clients → KYC
 */
export function useListingGuard(type: ListingType) {
  const navigate = useNavigate();
  const { role } = useApp();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      // mock auth: assume logged in. In a real backend swap with /auth/me.
      const meta = TYPE_META[type];
      const useKyb =
        role === "agent" || role === "admin" || meta.verification === "kyb";
      const next = `/list/${type}`;
      if (useKyb) {
        const k = await getMyKyb(USER_ID);
        if (!k || k.status !== "verified") {
          navigate(`/kyb?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }
      } else {
        const k = await getMyKyc(USER_ID);
        if (!k || k.status !== "approved") {
          navigate(`/kyc?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }
      }
      setReady(true);
    };
    run();
  }, [navigate, role, type]);

  return ready;
}

export function GuardLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
