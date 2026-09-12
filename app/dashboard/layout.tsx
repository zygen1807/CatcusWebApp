import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MobileDrawer from "./components/MobileDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f6ead8] flex-col md:flex-row">
      {/* Mobile drawer visible on small screens */}
      <MobileDrawer />

      {/* Desktop sidebar (hidden on small screens) */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
