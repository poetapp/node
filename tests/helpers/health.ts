import fetch from 'node-fetch'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`
export const getHealth = (port: string, host?: string) => fetch(`${baseUrl(port, host)}/health/`)
