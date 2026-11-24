// story: e03s02 — canary build env
const DEFAULT_REPO = "https://github.com/danielvm-git/appwrite-canary-shell";

export function AppFooter({ testId }: { testId: string }) {
  const version = __APP_VERSION__;
  const canaryName = import.meta.env.VITE_CANARY_NAME || "Tasks";
  const productLabel = import.meta.env.VITE_PRODUCT_LABEL || "Todo API";
  const repoUrl = import.meta.env.VITE_REPO_URL || DEFAULT_REPO;
  return (
    <footer className="app-footer" data-testid={testId}>
      <span>
        © 2026 {canaryName} · {productLabel}
      </span>
      <div className="app-footer-meta">
        <span>v{version}</span>
        <span>
          Built with{" "}
          <a className="strong" href="https://github.com/danielvm-git/BigPowers" target="_blank" rel="noreferrer">
            BigPowers
          </a>{" "}
          by{" "}
          <a className="strong" href="https://github.com/danielvm-git" target="_blank" rel="noreferrer">
            danielvm-git
          </a>
        </span>
        <a href={repoUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={`${repoUrl}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
          Changelog
        </a>
      </div>
    </footer>
  );
}