// Interfaces and Enums used with Bitcoin Core's RPC.

export enum GetBlockVerbosity {
  Hex = 0,
  Parsed = 1,
  Transactions = 2,
}

export interface Block {
  hash: string
  confirmations: number
  strippedsize: number
  size: number
  weight: number
  height: number
  version: number
  versionHex: string
  merkleroot: string
  tx: ReadonlyArray<Transaction>
  time: number
  mediantime: number
  nonce: number
  bits: string
  difficulty: string
  chainwork: string
  nTx: number
  previousblockhash: string
  nextblockhash: string
}

export interface Transaction {
  txid: string
  hash: string
  version: number
  size: number
  vsize: number
  locktime: number
  vin: ReadonlyArray<VIn>
  vout: ReadonlyArray<VOut>
  hex: string
}

export interface VIn {
  sequence: number
  coinbase?: string
  txid?: string
  vout?: number
  scriptSig?: {
    asm: string
    hex: string,
  }
}

export interface VOut {
  value: number
  n: number
  scriptPubKey: {
    asm: string
    hex: string
    type: string
    reqSigs: number
    addresses: ReadonlyArray<string>,
  }
}

export interface UnspentOutput {
  readonly txid: string
  readonly vout: number
  readonly address: string
  readonly scriptPubKey: string
  readonly amount: number
  readonly confirmations: number
  readonly spendable: boolean
  readonly solvable: boolean
  readonly safe: boolean
}
