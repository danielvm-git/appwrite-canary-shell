type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | undefined>;

function emit(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    service: "todo-client",
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const clientLog = {
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, err: unknown, fields?: LogFields) => {
    const errName = err instanceof Error ? err.name : "Error";
    const errMessage = err instanceof Error ? err.message : String(err);
    emit("error", message, {
      ...fields,
      errName,
      errMessage,
    });
  },
};