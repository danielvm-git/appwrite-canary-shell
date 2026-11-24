import { Link } from "react-router-dom";
import { Icon } from "../components/ui";
import { useTodo } from "../hooks/useTodo";
import { LIST_COLORS } from "../lib/taskView";
import { PageHead } from "./AppLayout";

export function ListsPage() {
  const { tasks, lists, removeList, openDialog } = useTodo();

  return (
    <>
      <PageHead title="Lists" />
      <div className="card table-card">
        <div className="table-head-row">
          <div>
            <div className="card-title">Your lists</div>
            <div className="muted">Lists are private to your account.</div>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openDialog({ kind: "list" })}>
            <Icon name="plus" />
            New list
          </button>
        </div>
        {lists.map((l, i) => {
          const count = tasks.filter((t) => t.listId === l.$id).length;
          return (
            <div key={l.$id} className="list-row">
              <span className="dot" style={{ background: l.color || LIST_COLORS[i % LIST_COLORS.length] }} />
              <Link className="nav-name" to={`/tasks?scope=${l.$id}`}>
                {l.name}
              </Link>
              <span className="muted">{count} tasks</span>
              <button
                type="button"
                className="icon-btn sm"
                title="Delete list"
                aria-label={`Delete ${l.name}`}
                onClick={() => confirm(`Delete list "${l.name}"? Its tasks move to Inbox.`) && void removeList(l)}
              >
                <Icon name="trash" />
              </button>
            </div>
          );
        })}
        {lists.length === 0 && <div className="empty">No lists yet.</div>}
      </div>
    </>
  );
}
