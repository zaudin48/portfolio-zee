import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ThemedBackground from "./components/ThemedBackground";
import WebClickBurst from "./components/WebClickBurst";
import SecretGesture from "./components/SecretGesture";
import SpiderVisitor from "./components/SpiderVisitor";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Work from "./pages/Work";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminAnalytics from "./pages/AdminAnalytics";
import TrackVisitor from "./components/TrackVisitor";

import { firebaseConfigured } from "./lib/firebase";
import { subscribeWork, subscribeSettings, DEFAULT_SETTINGS } from "./lib/data";
import { useAuth } from "./lib/useAuth";
import { applyStoredTheme } from "./lib/theme";

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="px-5 py-24 text-center text-muted">Checking session...</div>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function HomeOnlySpider({ themes }) {
  const location = useLocation();
  if (location.pathname !== "/") return null;
  return <SpiderVisitor themes={themes} />;
}

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [work, setWork] = useState([]);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsubSettings = subscribeSettings(setSettings);
    const unsubWork = subscribeWork(setWork);
    return () => {
      unsubSettings();
      unsubWork();
    };
  }, []);

  useEffect(() => {
    applyStoredTheme(settings?.themes);
  }, [settings?.themes]);

  return (
    <HashRouter>
      <ThemedBackground />
      <WebClickBurst />
      <SecretGesture />
      <HomeOnlySpider themes={settings?.themes} />
      <TrackVisitor />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home settings={settings} work={work} />} />
            <Route path="/work" element={<Work work={work} />} />
            <Route path="/contact" element={<Contact settings={settings} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdmin>
                  <AdminPanel settings={settings} work={work} />
                </ProtectedAdmin>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedAdmin>
                  <AdminAnalytics />
                </ProtectedAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer name={settings?.name} />
      </div>
    </HashRouter>
  );
}