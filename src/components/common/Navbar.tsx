import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const navItems = [
    { id: "dashboard", label: "Feed" },
    { id: "disaster", label: "Disasters" },
    { id: "verify", label: "Verify" },
  ];

  return (
    <>
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
          <span className="nav-logo-text">SEWA</span>
        </Link>

        <div className="nav-links desktop-only">
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

        <div className="nav-actions desktop-only">
          <button
            className="nav-btn nav-sos-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("openSOS"))}
          >
            🚨 SOS
          </button>

          <button
            className="nav-btn nav-report-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("openReport"))}
          >
            📝 Report
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
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent("openVerify"))}>
                  🏅 Get Verified
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">👤 Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => useAuthStore.getState().signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="nav-avatar nav-login-btn"
              onClick={() => useAuthStore.getState().signIn()}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-menu-item ${activeScreen === item.id ? "active" : ""}`}
              onClick={() => {
                onNavigate?.(item.id);
                setMobileMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
          <div className="mobile-menu-divider" />
          <button
            className="mobile-menu-item sos"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openSOS"));
              setMobileMenuOpen(false);
            }}
          >
            🚨 SOS
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openReport"));
              setMobileMenuOpen(false);
            }}
          >
            📝 Report
          </button>
          {user ? (
            <>
              <div className="mobile-menu-divider" />
              <button
                className="mobile-menu-item"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("openVerify"));
                  setMobileMenuOpen(false);
                }}
              >
                🏅 Get Verified
              </button>
              <button
                className="mobile-menu-item"
                onClick={() => {
                  useAuthStore.getState().signOut();
                  setMobileMenuOpen(false);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="mobile-menu-item login"
              onClick={() => {
                useAuthStore.getState().signIn();
                setMobileMenuOpen(false);
              }}
            >
              Login
            </button>
          )}
        </div>
      )}
    </>
  );
}
