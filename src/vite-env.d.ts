/// <reference types="vite/client" />
import { ThreeElements } from '@react-three/fiber';

interface ImportMetaEnv {
  readonly VITE_BACKEND_API_BASE_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
