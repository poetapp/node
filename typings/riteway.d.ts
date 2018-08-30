declare module 'riteway' {
  export function describe(label: string, callback: describeCallback): void

  type describeCallback = (should: should) => Promise<void>

  type should = (label?: string) => { assert: assert }

  type assert = (assertion: Assertion) => void

  interface Assertion {
    readonly given: string
    readonly should?: string
    readonly actual: any
    readonly expected: any
  }
}
