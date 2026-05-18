import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Kurslar from "./pages/Kurslar";
import Oqituvchilar from "./pages/Oqituvchilar";
import Talabalar from "./pages/Talabalar";
import Guruhlar from "./pages/Guruhlar";
import Xonalar from "./pages/Xonalar";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "kurslar", element: <Kurslar /> },
      { path: "oqituvchilar", element: <Oqituvchilar /> },
      { path: "students", element: <Talabalar /> },
      { path: "groups", element: <Guruhlar /> },
      { path: "xonalar", element: <Xonalar /> },
    ],
  },
]);
