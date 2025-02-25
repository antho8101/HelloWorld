
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Index } from "@/pages/Index";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Messages } from "@/pages/Messages";
import { Profile } from "@/pages/Profile";
import { ProfileEdit } from "@/pages/ProfileEdit";
import { PublicProfile } from "@/pages/PublicProfile";
import { NotFound } from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
