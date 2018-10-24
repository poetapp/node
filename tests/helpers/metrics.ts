/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'

import { baseUrl } from './utils'

export const getMetrics = (port: string, host?: string) => fetch(`${baseUrl(port, host)}/metrics/`)
