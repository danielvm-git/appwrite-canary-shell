import { useEffect, type ReactNode } from "react";
import type { Task, TaskPriority, TaskStatus } from "../lib/tasks";
import { avatarTone, initials, priorityLabel, statusLabel, type Person } from "../lib/taskView";

export function Icon({ name, className }: { name: string; className?: string }) {
  return <i className={`ph ph-${name}${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}

export function Avatar({ id, name }: { id: string; name: string }) {
  return (
    <span className={`avatar tone-${avatarTone(id)}`} title={name}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ people }: { people: Person[] }) {
  return (
    <div className="avatar-stack">
      {people.map((p) => (
        <span key={p.id} className={`avatar tone-${avatarTone(p.id)}`} title={p.name}>
          {p.initials}
        </span>
      ))}
    </div>
  );
}

const STATUS_TINT: Record<TaskStatus, string> = {
  open: "",
  doing: "tint-sky",
  review: "tint-amber",
  done: "tint-emerald",
};

const PRIORITY_TINT: Record<TaskPriority, string> = {
  high: "tint-rose",
  mid: "tint-amber",
  low: "",
};

export const STATUS_DOT: Record<TaskStatus, string> = {
  open: "var(--c2)",
  doing: "var(--sky)",
  review: "var(--amber)",
  done: "var(--emerald)",
};

export const STATUS_BAR: Record<TaskStatus, string> = {
  open: "var(--c1)",
  doing: "var(--c2)",
  review: "var(--c3)",
  done: "var(--c4)",
};

export const PRIORITY_BAR: Record<TaskPriority, string> = {
  high: "var(--c4)",
  mid: "var(--c3)",
  low: "var(--c2)",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge ${STATUS_TINT[status]}`}>{statusLabel(status)}</span>;
}

export function PriorityBadge({ task }: { task: Task }) {
  const priority = task.priority ?? "mid";
  return <span className={`badge ${PRIORITY_TINT[priority]}`}>{priorityLabel(priority)}</span>;
}

export function Modal({
  label,
  onClose,
  children,
  width,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={label} style={width ? { width: `min(${width}px, 92vw)` } : undefined}>
        {children}
      </div>
    </div>
  );
}
