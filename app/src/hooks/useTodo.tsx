import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { deleteAttachment } from "../lib/attachments";
import { createList, deleteList, listListsForUser, type TodoList } from "../lib/lists";
import { clientLog } from "../lib/log";
import { shareTaskByEmail } from "../lib/share";
import {
  createTask,
  deleteTask,
  listAccessibleTasks,
  setTaskStatus,
  type Task,
  type TaskInput,
  type TaskStatus,
} from "../lib/tasks";

export type Me = { id: string; name: string; email: string };

export type Dialog =
  | { kind: "create"; status?: TaskStatus }
  | { kind: "share"; taskId: string }
  | { kind: "list" }
  | null;

type TodoState = {
  me: Me;
  tasks: Task[];
  lists: TodoList[];
  loading: boolean;
  notice: string | null;
  dismissNotice: () => void;
  reload: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<Task>;
  moveTask: (task: Task, status: TaskStatus) => Promise<void>;
  removeTask: (task: Task) => Promise<void>;
  shareTask: (task: Task, email: string) => Promise<void>;
  replaceTask: (task: Task) => void;
  addList: (name: string, color: string) => Promise<TodoList>;
  removeList: (list: TodoList) => Promise<void>;
  dialog: Dialog;
  openDialog: (dialog: Dialog) => void;
};

const TodoContext = createContext<TodoState | null>(null);

function message(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function TodoProvider({ me, children }: { me: Me; children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);

  const reload = useCallback(async () => {
    try {
      const [nextTasks, nextLists] = await Promise.all([listAccessibleTasks(me.id), listListsForUser(me.id)]);
      setTasks(nextTasks);
      setLists(nextLists);
    } catch (err) {
      clientLog.error("todo load failed", err, { operation: "reload" });
      setNotice(message(err, "Could not load your tasks."));
    } finally {
      setLoading(false);
    }
  }, [me.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replaceTask = useCallback((task: Task) => {
    setTasks((prev) => prev.map((t) => (t.$id === task.$id ? { ...t, ...task } : t)));
  }, []);

  const addTask = useCallback(
    async (input: TaskInput) => {
      const task = await createTask(me.id, { ...input, ownerName: me.name });
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [me.id, me.name],
  );

  const moveTask = useCallback(
    async (task: Task, status: TaskStatus) => {
      if (task.status === status) return;
      replaceTask({ ...task, status });
      try {
        await setTaskStatus(me.id, task, status);
      } catch (err) {
        replaceTask(task);
        setNotice(message(err, "Could not update the task."));
      }
    },
    [me.id, replaceTask],
  );

  const removeTask = useCallback(
    async (task: Task) => {
      try {
        await deleteTask(me.id, task.$id);
        setTasks((prev) => prev.filter((t) => t.$id !== task.$id));
        if (task.attachmentId) {
          await deleteAttachment(task.attachmentId).catch((err) =>
            clientLog.warn("attachment cleanup failed", { operation: "removeTask", err: String(err) }),
          );
        }
      } catch (err) {
        setNotice(message(err, "Could not delete the task."));
      }
    },
    [me.id],
  );

  const shareTask = useCallback(
    async (task: Task, email: string) => {
      const result = await shareTaskByEmail(task.$id, email);
      replaceTask({ ...task, ...result });
    },
    [replaceTask],
  );

  const addList = useCallback(
    async (name: string, color: string) => {
      const list = await createList(me.id, name, color);
      setLists((prev) => [...prev, list].sort((a, b) => a.name.localeCompare(b.name)));
      return list;
    },
    [me.id],
  );

  const removeList = useCallback(
    async (list: TodoList) => {
      try {
        await deleteList(me.id, list.$id);
        setLists((prev) => prev.filter((l) => l.$id !== list.$id));
      } catch (err) {
        setNotice(message(err, "Could not delete the list."));
      }
    },
    [me.id],
  );

  const value = useMemo<TodoState>(
    () => ({
      me,
      tasks,
      lists,
      loading,
      notice,
      dismissNotice: () => setNotice(null),
      reload,
      addTask,
      moveTask,
      removeTask,
      shareTask,
      replaceTask,
      addList,
      removeList,
      dialog,
      openDialog: setDialog,
    }),
    [me, tasks, lists, loading, notice, reload, addTask, moveTask, removeTask, shareTask, replaceTask, addList, removeList, dialog],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoState {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
}
