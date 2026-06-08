  import { createBrowserRouter, Navigate } from "react-router-dom";
  import Layout from "./components/Layout";
  import Dashboard from "./pages/Dashboard";
  import Login from "./pages/Login";
  import Kurslar from "./pages/Kurslar";
  import Oqituvchilar from "./pages/Oqituvchilar";
  import Talabalar from "./pages/Talabalar";
  import Guruhlar from "./pages/Guruhlar";
  import Xonalar from "./pages/Xonalar";
  import Xodimlar from "./pages/Xodimlar";
  import GroupDetails from "./pages/GroupDetails";
  import AddHomework from "./pages/AddHomework";
  import HomeworkDetail from "./pages/HomeworkDetail";
  import HomeworkReview from "./pages/HomeworkReview";

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
        { path: "groups/:id", element: <GroupDetails /> },
        { path: "groups/:id/homework", element: <AddHomework /> },
        { path: "groups/:id/homework/:lessonId", element: <AddHomework /> },
        { path: "groups/:id/homework-detail/:homeworkId", element: <HomeworkDetail /> },
        { path: "groups/:id/homework-detail/:homeworkId/review/:studentId", element: <HomeworkReview /> },
        { path: "xonalar", element: <Xonalar /> },
        { path: "xodimlar", element: <Xodimlar /> },
      ],
    },
  ]);
