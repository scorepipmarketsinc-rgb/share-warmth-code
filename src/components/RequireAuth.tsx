import { Navigate, useLocation } from "react-router-dom";
import { isAuthed } from "@/lib/auth";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthed()) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  return children;
}
