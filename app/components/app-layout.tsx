import type { ReactNode } from "react";
import { Navigation } from "./navigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
    </>
  );
}