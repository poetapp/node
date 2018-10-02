import { Claim } from '@po.et/poet-js'
import fetch from 'node-fetch'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`
export const getWork = (port: string, host?: string) => (id: string) => fetch(`${baseUrl(port, host)}/works/${id}`)

export const postWork = (port: string, host?: string) => (claim: Claim) =>
  fetch(`${baseUrl(port, host)}/works/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claim),
  })
