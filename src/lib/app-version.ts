import { version } from '../../package.json'

export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? version ?? 'dev'
