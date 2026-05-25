import { BookOpen } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-8 h-8 text-accent" strokeWidth={1.5} />
          <span className="text-2xl font-bold text-ink-900 font-serif">Writerly</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
