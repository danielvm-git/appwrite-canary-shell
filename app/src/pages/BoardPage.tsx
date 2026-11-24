import { useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { AvatarStack, Icon, PriorityBadge, STATUS_DOT } from "../components/ui";
import { useScope } from "../hooks/useScope";
import { useTodo } from "../hooks/useTodo";
import type { Task, TaskStatus } from "../lib/tasks";
import {
  STATUSES,
  formatDue,
  isOverdue,
  isOwner,
  listName,
  taskNumber,
  taskPeople,
  toDay,
  visibleTasks,
} from "../lib/taskView";
import { PageHead } from "./AppLayout";

function BoardCard({ task, today, dragging, onDragStart, onDragEnd }: {
  task: Task;
  today: string;
  dragging: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}) {
  const { me, lists, moveTask, removeTask, openDialog } = useTodo();
  const done = task.status === "done";
  const own = isOwner(task, me.id);

  return (
    <article draggable className={`task-card${dragging ? " dragging" : ""}`} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="task-card-meta">
        <span>
          #{taskNumber(task)} · {listName(task.listId, lists)}
        </span>
        <PriorityBadge task={task} />
      </div>
      <Link to={`/tasks/${task.$id}`} className={`task-card-title${done ? " done-text" : ""}`} draggable={false}>
        {task.title}
      </Link>
      <div className="task-card-foot">
        <AvatarStack people={taskPeople(task, me)} />
        <span className={`due${isOverdue(task, today) ? " overdue" : ""}`}>
          <Icon name="calendar-blank" />
          {formatDue(task)}
        </span>
      </div>
      <div className="task-card-actions">
        <button
          type="button"
          className="icon-btn sm"
          title="Complete / reopen"
          aria-label={done ? "Reopen task" : "Complete task"}
          onClick={() => void moveTask(task, done ? "open" : "done")}
        >
          <Icon name="check-circle" />
        </button>
        {own && (
          <>
            <button type="button" className="icon-btn sm" title="Share" aria-label="Share" onClick={() => openDialog({ kind: "share", taskId: task.$id })}>
              <Icon name="share-network" />
            </button>
            <button
              type="button"
              className="icon-btn sm"
              title="Delete"
              aria-label="Delete"
              onClick={() => confirm(`Delete "${task.title}"?`) && void removeTask(task)}
            >
              <Icon name="trash" />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function BoardPage() {
  const { me, tasks, moveTask, openDialog } = useTodo();
  const { scope, q } = useScope();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);
  const today = toDay(new Date());
  const vis = visibleTasks(tasks, { scope, q, me: me.id });

  function onDrop(e: DragEvent, status: TaskStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    const task = tasks.find((t) => t.$id === id);
    if (task) void moveTask(task, status);
    setDragId(null);
    setOver(null);
  }

  return (
    <>
      <PageHead title="Board" scoped />
      <div className="board">
        {STATUSES.map((col) => {
          const cards = vis.filter((t) => t.status === col.id);
          return (
            <section
              key={col.id}
              aria-label={col.label}
              className={`column${over === col.id ? " over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                if (over !== col.id) setOver(col.id);
              }}
              onDragLeave={() => over === col.id && setOver(null)}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="column-head">
                <span className="dot" style={{ background: STATUS_DOT[col.id] }} />
                <span style={{ flex: 1 }}>{col.label}</span>
                <span className="count">{cards.length}</span>
              </div>
              {cards.map((t) => (
                <BoardCard
                  key={t.$id}
                  task={t}
                  today={today}
                  dragging={dragId === t.$id}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", t.$id);
                    e.dataTransfer.effectAllowed = "move";
                    setDragId(t.$id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOver(null);
                  }}
                />
              ))}
              <button type="button" className="add-task" onClick={() => openDialog({ kind: "create", status: col.id })}>
                <Icon name="plus" />
                Add task
              </button>
            </section>
          );
        })}
      </div>
    </>
  );
}
