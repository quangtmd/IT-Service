/// <reference types="vite/client" />

import type { ThreeElements } from '@react-three/fiber';

interface ImportMetaEnv {
  readonly VITE_BACKEND_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend React's JSX namespace to include Three.js elements
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

// Support for older TypeScript/React versions or global JSX
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
