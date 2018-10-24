import fetch from 'node-fetch'

import { baseUrl } from './utils'

export const getHealth = (port: string, host?: string) => fetch(`${baseUrl(port, host)}/health/`)
