import { Home, QrCode, Wallet, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/qr-scanner", label: "Scan", icon: QrCode },
    { path: "/wallet-connect", label: "Wallet", icon: Wallet },
    { path: "/admin-dashboard", label: "Admin", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t z-50 flex justify-around py-2" role="navigation" aria-label="Mobile navigation">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-3 transition-colors",
                isActive ? "text-blue-500" : "text-slate-500"
              )}
            >
              <Icon size={18} className="mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
