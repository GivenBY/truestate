import AppSidebar from "@/components/sidebar";
import MainContent from "@/components/MainContent";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <MainContent />
      </div>
    </SidebarProvider>
  );
}
