import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AvatarStack, Icon, StatusBadge } from "../components/ui";
import { useTodo } from "../hooks/useTodo";
import { attachmentDownloadUrl, deleteAttachment, uploadAttachment } from "../lib/attachments";
import { clientLog } from "../lib/log";
import { getTask, updateTask, type Task, type TaskInput, type TaskPriority, type TaskStatus } from "../lib/tasks";
import { PRIORITIES, STATUSES, dueDay, isOwner, taskNumber, taskPeople } from "../lib/taskView";
import { PageHead } from "./AppLayout";

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function TaskDetailPage() {
  const { taskId = "" } = useParams();
  const navigate = useNavigate();
  const { me, tasks, lists, replaceTask, removeTask, openDialog } = useTodo();
  const cached = tasks.find((t) => t.$id === taskId);
  const [task, setTask] = useState<Task | undefined>(cached);
  const [form, setForm] = useState<TaskInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cached) {
      setTask(cached);
      return;
    }
    getTask(taskId)
      .then(setTask)
      .catch((err) => {
        clientLog.error("task detail load failed", err, { operation: "getTask", rowId: taskId });
        setError("Task not found or not shared with you.");
      });
  }, [cached, taskId]);

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title,
      notes: task.notes ?? "",
      status: task.status,
      priority: task.priority ?? "mid",
      dueDate: dueDay(task) ?? "",
      listId: task.listId ?? "",
    });
  }, [task]);

  if (error && !task) {
    return (
      <>
        <PageHead title="Task" />
        <div className="card card-pad">
          <div>{error}</div>
          <Link to="/tasks" className="btn" style={{ alignSelf: "flex-start" }}>
            Back to tasks
          </Link>
        </div>
      </>
    );
  }
  if (!task || !form) return <PageHead title="Task" />;

  const own = isOwner(task, me.id);
  const set = (patch: Partial<TaskInput>) => {
    setForm({ ...form, ...patch });
    setSaved(false);
  };

  async function apply(patch: Partial<TaskInput>) {
    const updated = await updateTask(me.id, taskId, patch);
    const merged = { ...task!, ...updated };
    setTask(merged);
    replaceTask(merged);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form!.title.trim()) {
      setError("Give the task a title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apply(
        own
          ? {
              ...form!,
              title: form!.title.trim(),
              dueDate: form!.dueDate ? new Date(`${form!.dueDate}T00:00:00Z`).toISOString() : "",
            }
          : { status: form!.status },
      );
      setSaved(true);
    } catch (err) {
      clientLog.error("task save failed", err, { operation: "saveTask", rowId: taskId });
      setError(errorText(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (task!.attachmentId) await deleteAttachment(task!.attachmentId);
      const fileId = await uploadAttachment(me.id, file);
      await apply({ attachmentId: fileId });
      input.value = "";
    } catch (err) {
      clientLog.error("attachment upload failed", err, { operation: "uploadAttachment" });
      setError(errorText(err, "Upload failed"));
    }
  }

  async function onRemoveAttachment() {
    if (!task!.attachmentId) return;
    try {
      await deleteAttachment(task!.attachmentId);
      await apply({ attachmentId: "" });
    } catch (err) {
      setError(errorText(err, "Remove failed"));
    }
  }

  async function onDelete() {
    if (!confirm(`Delete "${task!.title}"?`)) return;
    await removeTask(task!);
    navigate("/tasks", { replace: true });
  }

  return (
    <>
      <PageHead title={`#${taskNumber(task)} ${task.title}`} />
      <div className="detail">
        <form className="card card-pad" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="td-title">Title</label>
            <input id="td-title" className="input" value={form.title} disabled={!own} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="td-notes">Notes</label>
            <textarea id="td-notes" className="input" rows={5} value={form.notes} disabled={!own} onChange={(e) => set({ notes: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="td-status">Status</label>
              <select id="td-status" className="input" value={form.status} onChange={(e) => set({ status: e.target.value as TaskStatus })}>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="td-priority">Priority</label>
              <select
                id="td-priority"
                className="input"
                value={form.priority}
                disabled={!own}
                onChange={(e) => set({ priority: e.target.value as TaskPriority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="td-list">List</label>
              <select id="td-list" className="input" value={form.listId} disabled={!own} onChange={(e) => set({ listId: e.target.value })}>
                <option value="">Inbox</option>
                {lists.map((l) => (
                  <option key={l.$id} value={l.$id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="td-due">Due date</label>
              <input id="td-due" className="input" type="date" value={form.dueDate} disabled={!own} onChange={(e) => set({ dueDate: e.target.value })} />
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          <div className="dialog-actions">
            {saved && <span className="muted" style={{ alignSelf: "center" }}>Saved</span>}
            <Link to="/tasks" className="btn">
              Back
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <div className="card-title">People</div>
            <AvatarStack people={taskPeople(task, me)} />
            <div className="kv">
              <span>Owner</span>
              <span>{own ? "You" : task.ownerName || "Unknown"}</span>
            </div>
            <div className="kv">
              <span>Shared with</span>
              <span>{task.sharedNames?.length ? task.sharedNames.join(", ") : "Nobody yet"}</span>
            </div>
            <div className="kv">
              <span>Status</span>
              <span>
                <StatusBadge status={task.status} />
              </span>
            </div>
            {own && (
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-sm" onClick={() => openDialog({ kind: "share", taskId: task.$id })}>
                  <Icon name="share-network" />
                  Share
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => void onDelete()}>
                  <Icon name="trash" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {own && (
            <div className="card card-pad">
              <div className="card-title">Attachment</div>
              {task.attachmentId ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <a className="btn btn-sm" href={attachmentDownloadUrl(task.attachmentId)} target="_blank" rel="noreferrer">
                    <Icon name="download-simple" />
                    Download
                  </a>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => void onRemoveAttachment()}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="muted">No file attached (pdf, png, jpg, txt).</div>
              )}
              <form onSubmit={onUpload} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input className="input" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" style={{ paddingTop: 6 }} />
                <button type="submit" className="btn btn-sm" style={{ alignSelf: "flex-start" }}>
                  <Icon name="upload-simple" />
                  Upload
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
