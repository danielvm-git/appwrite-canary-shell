import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { DialogHost } from "../components/Dialogs";
import { Avatar, Icon } from "../components/ui";
import { useScope } from "../hooks/useScope";
import { useSession } from "../hooks/useSession";
import { useTheme } from "../hooks/useTheme";
import { TodoProvider, useTodo, type Me } from "../hooks/useTodo";
import { appwriteConfigured } from "../lib/appwrite";
import { LIST_COLORS, navCounts, scopeLabel } from "../lib/taskView";

const BOARD_VIEWS = ["/tasks", "/board"];
const DESKTOP = "(min-width: 861px)";

export function PageHead({ title, scoped = false }: { title: string; scoped?: boolean }) {
  const { lists } = useTodo();
  const { scope } = useScope();
  const prefix = scoped ? scopeLabel(scope, lists) : "";
  const full = prefix ? `${prefix} · ${title}` : title;
  return (
    <div className="page-head">
      <h1 className="page-title">{full}</h1>
      <div className="crumbs">
        <span>Tasks</span>
        <Icon name="caret-right" />
        <span>{full}</span>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { me, tasks, lists, openDialog } = useTodo();
  const { signOut } = useSession();
  const { scope, toggleScope, search } = useScope();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const counts = navCounts(tasks, me.id);
  const qs = search ? `?${search}` : "";
  const onBoardView = BOARD_VIEWS.includes(pathname);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  function pickScope(value: string) {
    if (onBoardView) toggleScope(value);
    else navigate(`/tasks?scope=${encodeURIComponent(value)}`);
    onNavigate();
  }

  function go(path: string) {
    navigate(path);
    setMenuOpen(false);
    onNavigate();
  }

  async function onSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  const nav = [
    { id: "dash", name: "Dashboard", icon: "squares-four", active: pathname === "/tasks", pick: () => go(`/tasks${qs}`) },
    { id: "board", name: "Board", icon: "kanban", active: pathname === "/board", pick: () => go(`/board${qs}`) },
    { id: "mine", name: "My tasks", icon: "user", count: counts.mine, active: onBoardView && scope === "mine", pick: () => pickScope("mine") },
    { id: "shared", name: "Shared with me", icon: "users-three", count: counts.shared, active: onBoardView && scope === "shared", pick: () => pickScope("shared") },
  ];

  return (
    <aside className="sidebar">
      <Link to="/tasks" className="brand" onClick={onNavigate}>
        <div className="brand-mark">
          <Icon name="check-square" />
        </div>
        <div className="brand-name">Tasks</div>
      </Link>
      <nav className="sidebar-nav" aria-label="Workspace">
        <div className="nav-label">Workspace</div>
        {nav.map((n) => (
          <button key={n.id} type="button" className={`nav-item${n.active ? " active" : ""}`} onClick={n.pick}>
            <Icon name={n.icon} />
            <span className="nav-name">{n.name}</span>
            <span className="nav-count">{n.count ?? ""}</span>
          </button>
        ))}
        <div className="nav-label">
          <span>Lists</span>
          <button type="button" className="icon-btn sm" title="New list" aria-label="New list" onClick={() => openDialog({ kind: "list" })}>
            <Icon name="plus" />
          </button>
        </div>
        {lists.map((l, i) => (
          <button
            key={l.$id}
            type="button"
            className={`nav-item${onBoardView && scope === l.$id ? " active" : ""}`}
            onClick={() => pickScope(l.$id)}
          >
            <span className="dot" style={{ background: l.color || LIST_COLORS[i % LIST_COLORS.length] }} />
            <span className="nav-name">{l.name}</span>
            <span className="nav-count">{counts.lists[l.$id] ?? 0}</span>
          </button>
        ))}
        {lists.length === 0 && <div className="nav-label">No lists yet</div>}
      </nav>
      <div className="sidebar-user" ref={menuRef}>
        {menuOpen && (
          <div className="menu" role="menu">
            <button type="button" role="menuitem" className="menu-item" onClick={() => go("/account")}>
              <Icon name="user-circle" />
              Account
            </button>
            <button type="button" role="menuitem" className="menu-item" onClick={() => go("/lists")}>
              <Icon name="list-bullets" />
              Manage lists
            </button>
            <button type="button" role="menuitem" className="menu-item danger" onClick={() => void onSignOut()}>
              <Icon name="sign-out" />
              Sign out
            </button>
          </div>
        )}
        <button type="button" className="user-btn" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          <Avatar id={me.id} name={me.name} />
          <div className="user-meta">
            <div className="user-name">{me.name}</div>
            <div className="user-email">{me.email}</div>
          </div>
          <Icon name="caret-up-down" />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { openDialog } = useTodo();
  const { q, setQ } = useScope();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();

  function onSearch(value: string) {
    if (BOARD_VIEWS.includes(pathname)) setQ(value);
    else navigate(`/tasks?q=${encodeURIComponent(value)}`);
  }

  return (
    <header className="topbar">
      <div className="topbar-group">
        <button type="button" className="icon-btn" title="Toggle sidebar" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
          <Icon name="sidebar-simple" />
        </button>
        <div className="search">
          <Icon name="magnifying-glass" />
          <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" />
        </div>
      </div>
      <div className="topbar-group">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openDialog({ kind: "create" })}>
          <Icon name="plus" />
          New task
        </button>
        <button type="button" className="icon-btn" title="Toggle theme" aria-label="Toggle theme" onClick={toggleTheme}>
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <div className="topbar-sep" />
        <Link to="/settings" className="icon-btn" title="Settings" aria-label="Settings">
          <Icon name="gear" />
        </Link>
      </div>
    </header>
  );
}

function Shell() {
  const { notice, dismissNotice } = useTodo();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia(DESKTOP).matches);
  const closeOnMobile = () => {
    if (!window.matchMedia(DESKTOP).matches) setSidebarOpen(false);
  };

  return (
    <div className="shell">
      {sidebarOpen && <Sidebar onNavigate={closeOnMobile} />}
      <div className="main-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="content">
          {notice && (
            <div className="notice" role="alert">
              <span>{notice}</span>
              <button type="button" className="icon-btn sm" aria-label="Dismiss" onClick={dismissNotice}>
                <Icon name="x" />
              </button>
            </div>
          )}
          <Outlet />
        </main>
        <AppFooter testId="console-app-footer" />
      </div>
      <DialogHost />
    </div>
  );
}

export function AppLayout() {
  const { user, loading } = useSession();
  if (loading) return null;
  if (!user) return appwriteConfigured() ? <Navigate to="/" replace /> : null;
  const me: Me = { id: user.$id, name: user.name || user.email.split("@")[0], email: user.email };
  return (
    <TodoProvider me={me}>
      <Shell />
    </TodoProvider>
  );
}
