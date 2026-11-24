declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_SHARE_FUNCTION_ID: string;
  readonly VITE_CANARY_NAME: string;
  readonly VITE_REPO_URL: string;
  readonly VITE_PRODUCT_LABEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}