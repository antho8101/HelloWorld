
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Profile } from "@/pages/Profile";
import { ProfileBio } from "@/pages/ProfileBio";
import { PublicProfile } from "@/pages/PublicProfile";
import { Toaster } from "@/components/ui/sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/profile/bio",
    element: <ProfileBio />,
  },
  {
    path: "/profile/:id",
    element: <PublicProfile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
