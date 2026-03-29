import { useState } from "react";
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
        <button className="nav-logo" onClick={() => onNavigate?.("dashboard")}>
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
        </button>

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
              <DropdownMenuContent align="end" className="nav-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <p className="dropdown-name">{profile?.full_name || user?.email?.split('@')[0]}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  {profile?.is_verified && (
                    <span className="verified-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                
                <DropdownMenuSeparator />
                
                {!profile?.is_verified && (
                  <DropdownMenuItem 
                    className="dropdown-item"
                    onClick={() => window.dispatchEvent(new CustomEvent("openVerify"))}
                  >
                    <span className="item-icon">🏅</span>
                    Get Verified
                  </DropdownMenuItem>
                )}
                
                {profile?.roles?.includes("admin" as any) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="dropdown-item"
                      onClick={() => window.dispatchEvent(new CustomEvent("openAdmin"))}
                    >
                      <span className="item-icon">⚙️</span>
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem 
                  className="dropdown-item"
                  onClick={() => window.dispatchEvent(new CustomEvent("openProfile"))}
                >
                  <span className="item-icon">👤</span>
                  Account Profile
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="dropdown-item"
                  onClick={() => window.dispatchEvent(new CustomEvent("openSettings"))}
                >
                  <span className="item-icon">⚙️</span>
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="dropdown-item logout"
                  onClick={() => useAuthStore.getState().signOut()}
                >
                  <span className="item-icon">🚪</span>
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
