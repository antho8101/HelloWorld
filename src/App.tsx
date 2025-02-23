
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Profile } from "@/pages/Profile";
import { Messages } from "@/pages/Messages";
import { Auth } from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
