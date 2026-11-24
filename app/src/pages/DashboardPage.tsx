import { Link } from "react-router-dom";
import { AvatarStack, Icon, PRIORITY_BAR, PriorityBadge, STATUS_BAR, StatusBadge } from "../components/ui";
import { useScope } from "../hooks/useScope";
import { useTodo } from "../hooks/useTodo";
import type { Task } from "../lib/tasks";
import {
  avatarTone,
  dashboardStats,
  formatDue,
  isOverdue,
  isOwner,
  listName,
  priorityShare,
  statusSummary,
  taskNumber,
  taskPeople,
  teamProgress,
  toDay,
  visibleTasks,
} from "../lib/taskView";
import { PageHead } from "./AppLayout";

type Trend = "up" | "down" | "flat";

function StatCard({ title, icon, value, pill, trend }: { title: string; icon: string; value: number; pill: string; trend: Trend }) {
  const tint = trend === "up" ? "tint-emerald" : trend === "down" ? "tint-rose" : "";
  const trendIcon = trend === "up" ? "trend-up" : trend === "down" ? "trend-down" : "minus";
  return (
    <div className="card card-pad">
      <div className="stat-head">
        <div className="stat-icon">
          <Icon name={icon} />
        </div>
        <div className="card-title">{title}</div>
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className={`pill ${tint}`}>
          <Icon name={trendIcon} />
          {pill}
        </span>
      </div>
    </div>
  );
}

function TaskRow({ task, today }: { task: Task; today: string }) {
  const { me, lists, moveTask, removeTask, openDialog } = useTodo();
  const done = task.status === "done";
  const own = isOwner(task, me.id);

  function onDelete() {
    if (confirm(`Delete "${task.title}"?`)) void removeTask(task);
  }

  return (
    <div className="task-grid" role="row">
      <input
        type="checkbox"
        checked={done}
        aria-label={done ? "Reopen task" : "Complete task"}
        onChange={() => void moveTask(task, done ? "open" : "done")}
      />
      <div className="cell-title">
        <Link to={`/tasks/${task.$id}`} className={done ? "done-text" : undefined}>
          {task.title}
        </Link>
        <div className="task-num">#{taskNumber(task)}</div>
      </div>
      <div className="cell-list">{listName(task.listId, lists)}</div>
      <AvatarStack people={taskPeople(task, me)} />
      <div>
        <PriorityBadge task={task} />
      </div>
      <div>
        <StatusBadge status={task.status} />
      </div>
      <div className={isOverdue(task, today) ? "overdue" : "muted"}>{formatDue(task)}</div>
      <div className="row-actions">
        {own && (
          <>
            <button type="button" className="icon-btn sm" title="Share" aria-label="Share" onClick={() => openDialog({ kind: "share", taskId: task.$id })}>
              <Icon name="share-network" />
            </button>
            <button type="button" className="icon-btn sm" title="Delete" aria-label="Delete" onClick={onDelete}>
              <Icon name="trash" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { me, tasks, loading } = useTodo();
  const { scope, q } = useScope();
  const today = toDay(new Date());
  const vis = visibleTasks(tasks, { scope, q, me: me.id });
  const stats = dashboardStats(vis, me.id, today);
  const people = teamProgress(vis, me);

  return (
    <>
      <PageHead title="Overview" scoped />
      <div className="stats">
        <StatCard title="Total tasks" icon="list-checks" value={stats.total} pill={`${stats.shared} shared`} trend="flat" />
        <StatCard title="Completed" icon="check-circle" value={stats.done} pill={`${stats.donePct}%`} trend={stats.done ? "up" : "flat"} />
        <StatCard title="In progress" icon="spinner-gap" value={stats.doing} pill={`${stats.review} in review`} trend="flat" />
        <StatCard
          title="Overdue"
          icon="warning-circle"
          value={stats.overdue}
          pill={stats.overdue ? `${stats.overdue} late` : "On track"}
          trend={stats.overdue ? "down" : "up"}
        />
      </div>

      <div className="charts">
        <div className="card card-pad">
          <div>
            <div className="card-title">Task summary</div>
            <div className="muted">Tasks by status</div>
          </div>
          <div className="bars">
            {statusSummary(vis).map((s) => (
              <div key={s.id} className="bar-col">
                <div className="bar-count">{s.count}</div>
                <div className="bar" style={{ height: `${s.heightPct}%`, background: STATUS_BAR[s.id] }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {statusSummary(vis).map((s) => (
              <div key={s.id}>{s.label}</div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <div>
            <div className="card-title">Priority</div>
            <div className="muted">Share of visible tasks</div>
          </div>
          {priorityShare(vis).map((p) => (
            <div key={p.id} className="prio-row">
              <div className="row-between">
                <span>{p.label}</span>
                <span className="muted">
                  {p.count} · {p.pct}%
                </span>
              </div>
              <div className="meter">
                <div style={{ width: `${p.pct}%`, background: PRIORITY_BAR[p.id] }} />
              </div>
            </div>
          ))}
          <div className="divider" />
          <div style={{ fontWeight: 500 }}>Team progress</div>
          {people.length === 0 && <div className="muted">No tasks in view.</div>}
          {people.map(({ person, pct }) => (
            <div key={person.id} className="team-row">
              <span className={`avatar tone-${avatarTone(person.id)}`} title={person.name}>
                {person.initials}
              </span>
              <div className="meter">
                <div style={{ width: `${pct}%`, background: "var(--primary)" }} />
              </div>
              <span className="pct">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card table-card" role="table" aria-label="Tasks">
        <div className="table-head-row">
          <div>
            <div className="card-title">Tasks</div>
            <div className="muted">{vis.length} in view</div>
          </div>
        </div>
        <div className="task-grid head" role="row">
          <span />
          <span>Task</span>
          <span>List</span>
          <span>Owner</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Due</span>
          <span />
        </div>
        {vis.map((t) => (
          <TaskRow key={t.$id} task={t} today={today} />
        ))}
        {!loading && vis.length === 0 && <div className="empty">No tasks match.</div>}
        {loading && <div className="empty">Loading…</div>}
      </div>
    </>
  );
}
