"use client";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname.startsWith("/signup")
    // add other auth routes here if needed
  ) return null;
  return <AppSidebar />;
} 