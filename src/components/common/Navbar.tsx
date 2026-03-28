import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/authStore";

interface NavbarProps {
  onNavigate?: (screen: string) => void;
  activeScreen?: string;
}

export function Navbar({ onNavigate, activeScreen = "dashboard" }: NavbarProps) {
  const { user, profile } = useAuthStore();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "detail", label: "Problem Detail" },
    { id: "onboard", label: "Onboarding" },
    { id: "disaster", label: "Disaster Room" },
  ];

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
          <circle cx="14" cy="14" r="13" fill="#1a9e6e" opacity="0.15" />
          <path
            d="M8 10c0 6 6 10 6 10s6-4 6-10"
            stroke="#1a9e6e"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="14" cy="8" r="2.5" fill="#1a9e6e" />
        </svg>
        Yuj
      </Link>

      <div className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${activeScreen === item.id ? "active" : ""}`}
            onClick={() => onNavigate?.(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button className="nav-cta" onClick={() => window.dispatchEvent(new CustomEvent("openAddModal"))}>
        <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> Start a Cause
      </button>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="nav-avatar">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5">
              <p className="font-medium text-sm">{profile?.full_name}</p>
              {profile?.is_verified && (
                <span className="text-xs text-green-600">Yuj Verified</span>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => useAuthStore.getState().signOut()}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          className="nav-avatar"
          onClick={() => useAuthStore.getState().signIn()}
          title="Sign in"
        >
          Login
        </button>
      )}
    </nav>
  );
}
