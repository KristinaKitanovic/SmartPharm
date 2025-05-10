import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { WelcomePage } from "./pages/WelcomePage";
import { CustomerLogin } from "./pages/CustomerLogin";
import { PharmacystLogin } from "./pages/PharmacystLogin";
import { CustomerShop } from "./pages/CustomerShop";
import { PharmacystDashboard } from "./pages/PharmacystDashboard";
import { PharmacystRegister } from "./pages/PharmacystRegister";
import { CustomerRegister } from "./pages/CustomerRegister";
import { Cart } from "./pages/Cart";
import "./styles/global.scss";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/CustomerLogin",
    element: <CustomerLogin />,
  },
  {
    path: "/PharmacystLogin",
    element: <PharmacystLogin />,
  },
  {
    path: "/CustomerShop",
    element: <CustomerShop />,
  },
  {
    path: "/PharmacystDashboard",
    element: <PharmacystDashboard />,
  },
  {
    path: "/CustomerRegister",
    element: <CustomerRegister />,
  },
  {
    path: "/PharmacystRegister",
    element: <PharmacystRegister />,
  },
  {
    path: "/Cart",
    element: <Cart />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
