import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { BookOpen } from "lucide-react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login", { replace: true });
      else setOk(true);
    });
  }, [navigate]);

  if (!ok) return <Loading />;
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
      else setOk(true);
    });
  }, [navigate]);

  if (!ok) return <Loading />;
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <BookOpen className="w-8 h-8 text-indigo-400 animate-pulse" strokeWidth={1.5} />
    </div>
  );
}
