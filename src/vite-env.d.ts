/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NASA_API_KEY: string
  readonly VITE_CUSCO_LAT: string
  readonly VITE_CUSCO_LON: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
