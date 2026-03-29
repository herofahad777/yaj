import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/common/Navbar";
import { DashboardScreen } from "@/components/screens/DashboardScreen";
import { DetailScreen } from "@/components/screens/DetailScreen";
import { DisasterScreen } from "@/components/screens/DisasterScreen";
import { ReportProblemScreen } from "@/components/screens/ReportProblemScreen";
import { VerificationScreen } from "@/components/screens/VerificationScreen";
import { SOSScreen } from "@/components/screens/SOSScreen";
import { LoginScreen } from "@/components/screens/LoginScreen";
import { AdminScreen } from "@/components/screens/AdminScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { AddProblemModal } from "@/components/features/AddProblemModal";
import { DonateModal } from "@/components/features/DonateModal";
import { ResponseModal } from "@/components/features/ResponseModal";
import { useAuthStore } from "@/features/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

type Screen = "dashboard" | "detail" | "disaster" | "report" | "verify" | "sos" | "admin" | "profile" | "settings";

interface ResponseProblemData {
  id: string;
  title: string;
  emoji: string;
  category: string;
}

function AppLayout() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseProblem, setResponseProblem] = useState<ResponseProblemData | null>(null);
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    const handleOpenAddModal = () => setShowAddModal(true);
    const handleOpenDonateModal = () => setShowDonateModal(true);
    const handleOpenSOS = () => setCurrentScreen("sos");
    const handleOpenReport = () => setCurrentScreen("report");
    const handleOpenVerify = () => setCurrentScreen("verify");
    const handleOpenAdmin = () => setCurrentScreen("admin");
    const handleOpenProfile = () => setCurrentScreen("profile");
    const handleOpenSettings = () => setCurrentScreen("settings");
    const handleOpenResponse = (e: CustomEvent<ResponseProblemData>) => {
      setResponseProblem(e.detail);
      setShowResponseModal(true);
    };
    
    window.addEventListener("openAddModal", handleOpenAddModal);
    window.addEventListener("openDonateModal", handleOpenDonateModal);
    window.addEventListener("openSOS", handleOpenSOS);
    window.addEventListener("openReport", handleOpenReport);
    window.addEventListener("openVerify", handleOpenVerify);
    window.addEventListener("openAdmin", handleOpenAdmin);
    window.addEventListener("openProfile", handleOpenProfile);
    window.addEventListener("openSettings", handleOpenSettings);
    window.addEventListener("openResponseModal", handleOpenResponse as EventListener);
    
    return () => {
      window.removeEventListener("openAddModal", handleOpenAddModal);
      window.removeEventListener("openDonateModal", handleOpenDonateModal);
      window.removeEventListener("openSOS", handleOpenSOS);
      window.removeEventListener("openReport", handleOpenReport);
      window.removeEventListener("openVerify", handleOpenVerify);
      window.removeEventListener("openAdmin", handleOpenAdmin);
      window.removeEventListener("openProfile", handleOpenProfile);
      window.removeEventListener("openSettings", handleOpenSettings);
      window.removeEventListener("openResponseModal", handleOpenResponse as EventListener);
    };
  }, []);

  const showScreen = (screen: string) => {
    const validScreens: Screen[] = ["dashboard", "detail", "disaster", "report", "verify", "sos", "admin", "profile", "settings"];
    if (validScreens.includes(screen as Screen)) {
      setCurrentScreen(screen as Screen);
    }
  };

  const renderScreen = () => {
    // Show login if not authenticated
    if (!user && initialized) {
      return <LoginScreen onLoginSuccess={() => setCurrentScreen("dashboard")} />;
    }

    switch (currentScreen) {
      case "dashboard":
        return (
          <DashboardScreen
            onShowDetail={() => showScreen("detail")}
            onShowDisaster={() => showScreen("disaster")}
            onOpenDonate={() => setShowDonateModal(true)}
          />
        );
      case "detail":
        return (
          <DetailScreen
            onBack={() => showScreen("dashboard")}
            onOpenDonate={() => setShowDonateModal(true)}
          />
        );
      case "disaster":
        return <DisasterScreen />;
      case "report":
        return (
          <ReportProblemScreen
            onBack={() => showScreen("dashboard")}
            onSubmit={() => showScreen("dashboard")}
          />
        );
      case "verify":
        return (
          <VerificationScreen
            onBack={() => showScreen("dashboard")}
            onComplete={() => showScreen("dashboard")}
          />
        );
      case "sos":
        return <SOSScreen onBack={() => showScreen("dashboard")} />;
      case "admin":
        return <AdminScreen onBack={() => showScreen("dashboard")} />;
      case "profile":
        return <ProfileScreen onBack={() => showScreen("dashboard")} />;
      case "settings":
        return <SettingsScreen onBack={() => showScreen("dashboard")} />;
      default:
        return (
          <DashboardScreen
            onShowDetail={() => showScreen("detail")}
            onShowDisaster={() => showScreen("disaster")}
            onOpenDonate={() => setShowDonateModal(true)}
          />
        );
    }
  };

  if (!initialized) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "#fff",
        gap: "1.5rem"
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #1a9e6e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div className="spinner"></div>
        <div style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "18px",
          fontWeight: "700",
          color: "#1a9e6e",
          letterSpacing: "2px"
        }}>SEWA</div>
      </div>
    );
  }

  const isLoginScreen = !user;

  return (
    <div className="flex min-h-screen flex-col">
      {!isLoginScreen && <Navbar onNavigate={showScreen} activeScreen={currentScreen} />}
      <main className="screen active flex-1" style={isLoginScreen ? { padding: 0 } : undefined}>
        {renderScreen()}
      </main>
      <AddProblemModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <DonateModal open={showDonateModal} onClose={() => setShowDonateModal(false)} />
      {responseProblem && (
        <ResponseModal
          open={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setResponseProblem(null);
          }}
          problem={responseProblem}
          helperId={user?.id || ""}
        />
      )}
    </div>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initial Auth Load
    initialize();

    // Safety Timeout: Force "initialized" to true after 2.5 seconds
    // to prevent infinite loading screen on slow networks.
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().initialized) {
        console.warn("Auth initialization timed out. Proceeding...");
        useAuthStore.setState({ initialized: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout />
      </Router>
    </QueryClientProvider>
  );
}
