declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_API_TIMEOUT: string;
    NEXT_PUBLIC_APP_NAME: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 