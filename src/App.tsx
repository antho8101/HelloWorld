
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Profile } from "@/pages/Profile";
import { Messages } from "@/pages/Messages";
import { ProfileEdit } from "@/pages/ProfileEdit";
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
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/messages/:conversationId",
    element: <Messages />,
  },
  {
    path: "/messages/user/:userId",
    element: <Messages />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/profile/edit",
    element: <ProfileEdit />,
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
