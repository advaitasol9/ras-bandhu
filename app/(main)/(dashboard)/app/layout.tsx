import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 md:px-8 lg:px-12 border-t pt-12 animate-in fade-in">
      {children}
    </div>
  );
}
