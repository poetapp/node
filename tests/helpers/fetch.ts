import { Response } from 'node-fetch'

export const getResponseJson = (x: Response) => x.json()

export const getResponseText = (x: Response) => x.text()
