<<<<<<< HEAD
//import Navbar from "../components/Navbar";
//import Footer from "../components/Footer";

export default function page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}

      <main className="flex-1">{children}</main>

      {/* <Footer /> */}
    </div>
  );
}
=======
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
>>>>>>> bab7634c8c6e5fc1248e5e3d381abd8e455a92d7
