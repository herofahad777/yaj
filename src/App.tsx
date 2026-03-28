import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/common/Navbar";
import { DashboardScreen } from "@/components/screens/DashboardScreen";
import { DetailScreen } from "@/components/screens/DetailScreen";
import { DisasterScreen } from "@/components/screens/DisasterScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { ReportProblemScreen } from "@/components/screens/ReportProblemScreen";
import { VerificationScreen } from "@/components/screens/VerificationScreen";
import { SOSScreen } from "@/components/screens/SOSScreen";
import { AddProblemModal } from "@/components/features/AddProblemModal";
import { DonateModal } from "@/components/features/DonateModal";
import { useAuthStore } from "@/features/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

type Screen = "dashboard" | "detail" | "onboard" | "disaster" | "report" | "verify" | "sos";

function AppLayout() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  useEffect(() => {
    const handleOpenAddModal = () => setShowAddModal(true);
    const handleOpenDonateModal = () => setShowDonateModal(true);
    const handleOpenSOS = () => setCurrentScreen("sos");
    const handleOpenReport = () => setCurrentScreen("report");
    const handleOpenVerify = () => setCurrentScreen("verify");
    
    window.addEventListener("openAddModal", handleOpenAddModal);
    window.addEventListener("openDonateModal", handleOpenDonateModal);
    window.addEventListener("openSOS", handleOpenSOS);
    window.addEventListener("openReport", handleOpenReport);
    window.addEventListener("openVerify", handleOpenVerify);
    
    return () => {
      window.removeEventListener("openAddModal", handleOpenAddModal);
      window.removeEventListener("openDonateModal", handleOpenDonateModal);
      window.removeEventListener("openSOS", handleOpenSOS);
      window.removeEventListener("openReport", handleOpenReport);
      window.removeEventListener("openVerify", handleOpenVerify);
    };
  }, []);

  const showScreen = (screen: string) => {
    const validScreens: Screen[] = ["dashboard", "detail", "onboard", "disaster", "report", "verify", "sos"];
    if (validScreens.includes(screen as Screen)) {
      setCurrentScreen(screen as Screen);
    }
  };

  const renderScreen = () => {
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
      case "onboard":
        return <OnboardingScreen onComplete={() => showScreen("dashboard")} />;
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onNavigate={showScreen} activeScreen={currentScreen} />
      <main className="screen active flex-1" id={`s-${currentScreen}`}>
        {renderScreen()}
      </main>
      <AddProblemModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <DonateModal open={showDonateModal} onClose={() => setShowDonateModal(false)} />
    </div>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
