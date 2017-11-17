declare module 'bitcore-lib' {
  export = bitcoreLib
}

declare namespace bitcoreLib {
  export const Block: Block
  export const Transaction: Transaction
  export const util: Util
  export const Script: Script
  export const PrivateKey: PrivateKey

  export namespace crypto {
    class BN { }
    namespace ECDSA {
      function sign(message: Buffer, key: PrivateKey): Signature
      function verify(hashbuf: Buffer, sig: Signature, pubkey: PublicKey, endian?: 'little'): boolean
    }
    export namespace Hash {
      function sha256(buffer: Buffer): Uint8Array
    }
    export const Random: RandomInterface
    export const Point: PointInterface

    class Signature {
      static fromDER(sig: Buffer): Signature
      static fromString(data: string): Signature
      SIGHASH_ALL: number
      toString(): string
    }
  }

  interface Transaction {
    inputs: Input[]
    outputs: Output[]
    readonly id: string
    readonly hash: string
    nid: string

    new (serialized?: any): this
    (serialized?: any): this

    from(utxos: UTXO[]): Transaction
    to(address: Address | string, amount: number): Transaction
    change(address: Address | string): Transaction
    sign(privateKey: PrivateKey | string): Transaction
    applySignature(sig: crypto.Signature): Transaction
    addData(data: Buffer): this
  }

  interface Block {
    hash: string
    transactions: any[]
    header: {
      time: number
      prevHash: string
    }

    new(data: Buffer | object): Block
    (data: Buffer | object): Block
  }

  interface PrivateKey {
    readonly publicKey: PublicKey

    new(key: string): this
    (source: string): this
  }

  class PublicKey {
    constructor(source: string)
  }

  interface Output {
    readonly script: any
  }

  interface Script {
    types: {
      DATA_OUT: string
    }
    buildPublicKeyHashOut(address: Address): Script
  }

  interface Util {
    readonly buffer: {
      reverse(a: any): any
    }
  }

  interface UnspentOutput {
    readonly address: Address
    readonly txId: string
    readonly outputIndex: number
    readonly script: Script
    readonly satoshis: number

    (data: object): this
    new (data: object): this

    inspect(): string
    fromObject(o: object): this
    toObject(): this
  }

  export namespace Networks {

    interface Network {
      readonly name: string
      readonly alias: string

    }

    export const livenet: Network
    export const mainnet: Network
    export const testnet: Network

    export function add(data: any): Network
    export function remove(network: Network): void
    export function get(args: string | number | Network, keys: string | string[]): Network
  }

}

interface Address {

}

interface Input {

}

interface UTXO {
}
interface RandomInterface {
}
interface PointInterface {
}
