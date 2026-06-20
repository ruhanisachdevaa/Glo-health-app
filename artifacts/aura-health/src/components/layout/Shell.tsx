import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Heart,
  Calendar,
  Activity,
  Dumbbell,
  ShoppingBag,
  Sparkles,
  MessageCircle,
  ClipboardList,
  Users,
  TrendingUp,
  MapPin,
  Flower2,
} from "lucide-react";
import type { UserProfile } from "@/App";

interface ShellProps {
  children: ReactNode;
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
}

export default function Shell({ children, profile }: ShellProps) {
  const [location] = useLocation();

  const baseLinks = [
    { href: "/", label: "Dashboard", icon: Heart },
    { href: "/tracker", label: "Cycle Tracker", icon: Calendar },
    { href: "/symptoms", label: "Symptoms & Mood", icon: Activity },
    { href: "/lifestyle", label: "Lifestyle Hub", icon: Dumbbell },
    { href: "/marketplace", label: "Shop", icon: ShoppingBag },
    { href: "/health-patterns", label: "Health Patterns", icon: TrendingUp },
    { href: "/zenzone", label: "Zen Zone", icon: Sparkles },
    { href: "/chatbot", label: "Aura Chat", icon: MessageCircle },
    { href: "/assessment", label: "Health Profile", icon: ClipboardList },
    { href: "/clinics", label: "Find Clinics", icon: MapPin },
    { href: "/partner", label: "Partner Sync", icon: Users },
  ];

  // PCOS users get a hub link at the top
  const links = profile.hasPcos
    ? [{ href: "/lifestyle", label: "PCOS Hub", icon: Flower2 }, ...baseLinks]
    : baseLinks;

  // Deduplicate by href
  const dedupedLinks = links.filter((l, i, arr) => arr.findIndex(x => x.href === l.href) === i);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 flex-shrink-0">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none" style={{ color: "#674D66" }}>Glo</h1>
                {profile.hasPcos && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9B7A9A" }}>PCOS Mode</span>
                )}
              </div>
            </div>
          </Link>
        </div>

        {profile.hasPcos && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "#EBD6DC", color: "#674D66" }}>
            🌸 PCOS personalisation is active
          </div>
        )}

        <nav className="flex-1 px-4 space-y-0.5 pb-4">
          {dedupedLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            const isPcosHub = link.label === "PCOS Hub";
            return (
              <Link key={link.href + link.label} href={link.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "font-semibold shadow-sm text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={isActive
                    ? { background: "linear-gradient(135deg, #674D66, #9B7A9A)" }
                    : isPcosHub
                    ? { background: "#EBD6DC", color: "#674D66" }
                    : {}
                  }
                >
                  <Icon size={17} />
                  <span className="text-sm">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary/50 rounded-xl">
            <span className="font-medium cursor-pointer text-foreground">🇬🇧 EN</span>
            <span className="opacity-40">/</span>
            <span className="cursor-pointer hover:text-foreground text-muted-foreground">🇮🇳 HI</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-3">Hi, {profile.name} 👋</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md flex items-center justify-around p-2 z-50">
        {dedupedLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href + link.label} href={link.href}>
              <div
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors"
                style={isActive ? { color: "#674D66" } : { color: "var(--muted-foreground)" }}
              >
                <Icon size={20} />
                <span className="text-[9px] font-medium">{link.label.split(" ")[0]}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
