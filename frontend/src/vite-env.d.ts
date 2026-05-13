/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Vite 开发端口（在 vite.config 中读取；也可在运行时可选用） */
  readonly VITE_DEV_PORT?: string
  /** 后端 API 根路径，例如 http://localhost:8089/api */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
