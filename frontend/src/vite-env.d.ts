/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AI_MODEL: string;
  //TypeScript报错的原因是缺少Vite环境变量的类型定义。
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
