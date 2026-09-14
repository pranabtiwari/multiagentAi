import { Routes, Route } from "react-router";
import Home from "./pages/home.jsx";
import Auth from "./pages/auth.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />
    </Routes>
  );
}

export default AppRoutes;