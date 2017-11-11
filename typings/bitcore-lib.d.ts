declare module 'bitcore-lib' {
  export = bitcoreLib
}

declare namespace bitcoreLib {
  export const Block: Block
  export const Transaction: Transaction
  export const util: Util
  export const Script: Script
  export const PrivateKey: PrivateKey
  // export const crypto: Crypto
  export namespace crypto {
    export const BN: BN
    export const ECDSA: ECDSAInterface
    export const Hash: HashInterface
    export const Random: RandomInterface
    export const Point: PointInterface
    export const Signature: SignatureInterface
  }

  interface Transaction {
    new (serialized?: any): this
    (serialized?: any): this

    inputs: Input[]
    outputs: Output[]
    readonly id: string
    readonly hash: string
    nid: string

    from(utxos: UTXO[]): Transaction
    to(address: Address, amount: number): Transaction
    to(address: string, amount: number): Transaction
    change(address: Address): Transaction
    change(address: string): Transaction
    sign(privateKey: PrivateKey): Transaction
    sign(privateKey: string): Transaction
    applySignature(sig: Signature): Transaction
    addData(data: Buffer): this
  }

  interface Block {
    new(data: Buffer | object): Block
    (data: Buffer | object): Block

    hash: string
    transactions: any[]
    header: {
      time: number
      prevHash: string
    }
  }

  interface PrivateKey {
    new(key: string): this
    (source: string): this

    publicKey: PublicKey
  }

  interface PublicKey {
    (source: string): this
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
    (data: object): this
    new (data: object): this

    inspect(): string
    fromObject(o: object): this
    toObject(): this

    readonly address: Address
    readonly txId: string
    readonly outputIndex: number
    readonly script: Script
    readonly satoshis: number
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

type BN = any;

//interface bitcoreLib {
//  version: string
//  crypto: Crypto
//  encoding: EncodingInterface
//  util: UtilsInterface
//
//  Address: IAddress
//  Block: Block
//  MerkleBlock: IMerkleBlock
//  BlockHeader: IBlockHeader
//  HDPrivateKey: IHDPrivateKey
//  HDPublicKey: IHDPublicKey
//  Opcode: IOpcode
//  PublicKey: IPublicKey
//  Script: IScript
//  URI: IURI
//  Unit: IUnit
//}

//interface IAddress {
//  (source: string, network: Network): Address
//  (source: PublicKey, network: Network): Address
//
//  isValid(something: any): boolean
//}
interface Address {

}
interface IMerkleBlock {}
interface IBlockHeader {}
interface IHDPrivateKey {}
interface IHDPublicKey {}
interface IOpcode {}

interface Script {}
//interface ITransaction {
//  UTXO: IUTOX
//  Sighash: ISighash
//}
//interface ISighash {
//  sighashPreimage(tx: Transaction, sighash: number, index: number, script: Script): Buffer
//}

interface Input {

}

interface IUTOX {
  (source: any): UTXO
}
interface UTXO {
}
interface IURI {}
interface IUnit {}

/**
 * Crypto
 */

interface Crypto {
  BN: BN
  ECDSA: ECDSAInterface
  Hash: HashInterface
  Random: RandomInterface
  Point: PointInterface
  Signature: SignatureInterface
}

interface ECDSAInterface {
}
interface HashInterface {
  sha256(buffer: Buffer): Uint8Array
}
interface RandomInterface {
}
interface PointInterface {
}
interface SignatureInterface {
  SIGHASH_ALL: number
  fromDER(sig: Buffer): Signature
}
interface Signature {}

interface EncodingInterface {
}
