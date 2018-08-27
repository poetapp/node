// TODO: make PR to @types/node-fetch

/* tslint:disable:no-unused-variable */

import * as fetch from 'node-fetch' // See https://github.com/Microsoft/TypeScript/issues/10859#issuecomment-246496707

declare module 'node-fetch' {
  export class FetchError extends Error {
    readonly name: string
    readonly type: string

    constructor(message: string, type: string, systemError: string)
  }
}
