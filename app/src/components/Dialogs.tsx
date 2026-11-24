import { useState, type FormEvent } from "react";
import { useScope } from "../hooks/useScope";
import { useTodo } from "../hooks/useTodo";
import type { TaskPriority, TaskStatus } from "../lib/tasks";
import { LIST_COLORS, PRIORITIES, STATUSES, addDays, toDay } from "../lib/taskView";
import { Modal } from "./ui";

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function NewTaskDialog({ status }: { status?: TaskStatus }) {
  const { lists, addTask, openDialog } = useTodo();
  const { scope } = useScope();
  const close = () => openDialog(null);
  const [title, setTitle] = useState("");
  const [listId, setListId] = useState(lists.some((l) => l.$id === scope) ? scope : (lists[0]?.$id ?? ""));
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(status ?? "open");
  const [priority, setPriority] = useState<TaskPriority>("mid");
  const [due, setDue] = useState(addDays(toDay(new Date()), 7));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }
    setSaving(true);
    try {
      await addTask({
        title: title.trim(),
        listId,
        status: taskStatus,
        priority,
        dueDate: due ? new Date(`${due}T00:00:00Z`).toISOString() : "",
      });
      close();
    } catch (err) {
      setError(errorText(err, "Could not create the task."));
      setSaving(false);
    }
  }

  return (
    <Modal label="New task" onClose={close}>
      <form onSubmit={onSubmit} style={{ display: "contents" }}>
        <h2 className="dialog-title">New task</h2>
        <div className="field">
          <label htmlFor="nt-title">Title</label>
          <input
            id="nt-title"
            className="input"
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            placeholder="What needs to be done?"
          />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="nt-list">List</label>
            <select id="nt-list" className="input" value={listId} onChange={(e) => setListId(e.target.value)}>
              <option value="">Inbox</option>
              {lists.map((l) => (
                <option key={l.$id} value={l.$id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="nt-status">Status</label>
            <select id="nt-status" className="input" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="nt-priority">Priority</label>
            <select id="nt-priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="nt-due">Due date</label>
            <input id="nt-due" className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ShareDialog({ taskId }: { taskId: string }) {
  const { tasks, shareTask, openDialog } = useTodo();
  const close = () => openDialog(null);
  const task = tasks.find((t) => t.$id === taskId);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!task) return null;
  const names = task.sharedNames?.length ? task.sharedNames.join(", ") : "nobody yet";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!task) return;
    setBusy(true);
    try {
      await shareTask(task, email);
      setEmail("");
      setError("");
    } catch (err) {
      setError(errorText(err, "Could not share the task."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal label="Share task" onClose={close} width={440}>
      <form onSubmit={onSubmit} style={{ display: "contents" }}>
        <div>
          <h2 className="dialog-title">Share task</h2>
          <div className="muted">{task.title}</div>
        </div>
        <input
          className="input"
          type="email"
          autoFocus
          aria-label="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="teammate@example.com"
        />
        {error && <div className="error-text">{error}</div>}
        <div className="muted">Shared with: {names}</div>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={close}>
            Close
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !email.trim()}>
            {busy ? "Sharing…" : "Share"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NewListDialog() {
  const { addList, openDialog } = useTodo();
  const close = () => openDialog(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(LIST_COLORS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the list a name.");
      return;
    }
    setSaving(true);
    try {
      await addList(name.trim(), color);
      close();
    } catch (err) {
      setError(errorText(err, "Could not create the list."));
      setSaving(false);
    }
  }

  return (
    <Modal label="New list" onClose={close} width={400}>
      <form onSubmit={onSubmit} style={{ display: "contents" }}>
        <h2 className="dialog-title">New list</h2>
        <div className="field">
          <label htmlFor="nl-name">Name</label>
          <input id="nl-name" className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Work" />
        </div>
        <div className="field">
          <span style={{ fontWeight: 500 }}>Color</span>
          <div className="swatches">
            {LIST_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                className={`swatch${c === color ? " selected" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            Create list
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function DialogHost() {
  const { dialog } = useTodo();
  if (!dialog) return null;
  if (dialog.kind === "create") return <NewTaskDialog status={dialog.status} />;
  if (dialog.kind === "share") return <ShareDialog taskId={dialog.taskId} />;
  return <NewListDialog />;
}
