import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
<<<<<<< HEAD
import MobileDrawer from "./components/MobileDrawer";
=======
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-[#f6ead8] flex-col md:flex-row">
      {/* Mobile drawer visible on small screens */}
      <MobileDrawer />

      {/* Desktop sidebar (hidden on small screens) */}
=======
    <div className="flex min-h-screen bg-gray-100">
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
<<<<<<< HEAD
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
=======
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
