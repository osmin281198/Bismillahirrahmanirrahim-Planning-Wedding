import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rab from "./pages/Rab";
import Planning from "./pages/Planning";
import Guests from "./pages/Guests";
import InvitationView from "./pages/InvitationView";
import Wishes from "./pages/Wishes";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rab" element={<Rab />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/wishes" element={<Wishes />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/invitation/:slug" element={<InvitationView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; // ✅ FIX: export yang benar
