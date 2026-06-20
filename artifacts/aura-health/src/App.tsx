import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Shell from "@/components/layout/Shell";
import Dashboard from "@/pages/Dashboard";
import Tracker from "@/pages/Tracker";
import Symptoms from "@/pages/Symptoms";
import Lifestyle from "@/pages/Lifestyle";
import Marketplace from "@/pages/Marketplace";
import ZenZone from "@/pages/ZenZone";
import Chatbot from "@/pages/Chatbot";
import Assessment from "@/pages/Assessment";
import Partner from "@/pages/Partner";
import HealthPatterns from "@/pages/HealthPatterns";
import Clinics from "@/pages/Clinics";
import Onboarding from "@/pages/Onboarding";

const queryClient = new QueryClient();

export interface UserProfile {
  name: string;
  hasPcos: boolean;
  onboardingComplete: boolean;
}

function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem("glo_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem("glo_profile", JSON.stringify(profile));
}

function Router({ profile, onProfileUpdate }: { profile: UserProfile; onProfileUpdate: (p: UserProfile) => void }) {
  return (
    <Shell profile={profile} onProfileUpdate={onProfileUpdate}>
      <Switch>
        <Route path="/" component={() => <Dashboard profile={profile} />} />
        <Route path="/tracker" component={Tracker} />
        <Route path="/symptoms" component={Symptoms} />
        <Route path="/lifestyle" component={Lifestyle} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/zenzone" component={ZenZone} />
        <Route path="/chatbot" component={Chatbot} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/partner" component={() => <Partner profile={profile} onProfileUpdate={onProfileUpdate} />} />
        <Route path="/health-patterns" component={HealthPatterns} />
        <Route path="/clinics" component={Clinics} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(getStoredProfile());

  const handleOnboardingComplete = (hasPcos: boolean, name: string) => {
    const newProfile: UserProfile = { name, hasPcos, onboardingComplete: true };
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleProfileUpdate = (updated: UserProfile) => {
    saveProfile(updated);
    setProfile(updated);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {!profile?.onboardingComplete ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <Router profile={profile} onProfileUpdate={handleProfileUpdate} />
          )}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
