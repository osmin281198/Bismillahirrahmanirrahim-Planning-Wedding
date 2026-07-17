import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import Rab            from "./pages/Rab";
import Planning       from "./pages/Planning";
import Guests         from "./pages/Guests";
import InvitationView from "./pages/InvitationView";
import Wishes         from "./pages/Wishes";
import Settings       from "./pages/Settings";
import Notes          from "./pages/Notes";
import Kas            from "./pages/Kas";
import Users          from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/invitation/:slug" element={<InvitationView />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rab"       element={<ProtectedRoute><Rab /></ProtectedRoute>} />
        <Route path="/planning"  element={<ProtectedRoute><Planning /></ProtectedRoute>} />
        <Route path="/guests"    element={<ProtectedRoute><Guests /></ProtectedRoute>} />
        <Route path="/wishes"    element={<ProtectedRoute><Wishes /></ProtectedRoute>} />
        <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notes"     element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/kas"       element={<ProtectedRoute><Kas /></ProtectedRoute>} />
        <Route path="/users"     element={<ProtectedRoute><Users /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
