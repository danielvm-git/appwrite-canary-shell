import { Link } from "react-router-dom";
import { Icon } from "../components/ui";
import { useTheme, type Theme } from "../hooks/useTheme";
import { useTodo } from "../hooks/useTodo";
import { PageHead } from "./AppLayout";

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
];

export function SettingsPage() {
  const [theme, toggleTheme] = useTheme();
  const { me, lists } = useTodo();

  return (
    <>
      <PageHead title="Settings" />
      <div className="card card-pad" style={{ maxWidth: 560 }}>
        <div>
          <div className="card-title">Appearance</div>
          <div className="muted">Choose the theme for this browser.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`btn btn-sm${theme === t.id ? " btn-primary" : ""}`}
              aria-pressed={theme === t.id}
              onClick={() => theme !== t.id && toggleTheme()}
            >
              <Icon name={t.icon} />
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="card table-card" style={{ maxWidth: 560 }}>
        <Link to="/lists" className="list-row" style={{ borderTop: 0 }}>
          <Icon name="list-bullets" />
          <span className="nav-name">Lists</span>
          <span className="muted">{lists.length}</span>
          <Icon name="caret-right" />
        </Link>
        <Link to="/account" className="list-row">
          <Icon name="user-circle" />
          <span className="nav-name">Account</span>
          <span className="muted">{me.email}</span>
          <Icon name="caret-right" />
        </Link>
      </div>
    </>
  );
}
