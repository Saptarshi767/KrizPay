import { Home, QrCode, Wallet, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileNav({ currentSection, onSectionChange }: MobileNavProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "qr-scanner", label: "Scan", icon: QrCode },
    { id: "wallet-connect", label: "Wallet", icon: Wallet },
    { id: "admin-dashboard", label: "Admin", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t z-50 flex justify-around py-2" role="navigation" aria-label="Mobile navigation">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
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
