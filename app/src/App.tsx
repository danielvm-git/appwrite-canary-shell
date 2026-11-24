import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AccountPage } from "./pages/AccountPage";
import { AppLayout } from "./pages/AppLayout";
import { BoardPage } from "./pages/BoardPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ListsPage } from "./pages/ListsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignInPage } from "./pages/SignInPage";
import { TaskDetailPage } from "./pages/TaskDetailPage";

function ListRedirect() {
  const { listId = "" } = useParams();
  return <Navigate to={`/tasks?scope=${encodeURIComponent(listId)}`} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/console/*" element={<Navigate to="/tasks" replace />} />
        <Route element={<AppLayout />}>
          <Route path="tasks" element={<DashboardPage />} />
          <Route path="tasks/new" element={<Navigate to="/tasks" replace />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="lists" element={<ListsPage />} />
          <Route path="lists/:listId" element={<ListRedirect />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
