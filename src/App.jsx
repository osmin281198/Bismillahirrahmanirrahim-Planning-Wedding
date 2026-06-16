import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import Rab            from "./pages/Rab";
import Planning       from "./pages/Planning";
import Guests         from "./pages/Guests";
import InvitationView from "./pages/InvitationView";
import Wishes         from "./pages/Wishes";
import Settings       from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman publik */}
        <Route path="/" element={<Login />} />
        <Route path="/invitation/:slug" element={<InvitationView />} />

        {/* Halaman yang butuh login */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rab"       element={<ProtectedRoute><Rab /></ProtectedRoute>} />
        <Route path="/planning"  element={<ProtectedRoute><Planning /></ProtectedRoute>} />
        <Route path="/guests"    element={<ProtectedRoute><Guests /></ProtectedRoute>} />
        <Route path="/wishes"    element={<ProtectedRoute><Wishes /></ProtectedRoute>} />
        <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
