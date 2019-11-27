import { flow } from 'fp-ts/lib/function'
import Web3 from 'web3'
import { PromiEvent, TransactionReceipt, SignedTransaction, TransactionConfig } from 'web3-core'
import { ContractSendMethod } from 'web3-eth-contract'

import { asyncPipe } from 'Helpers/asyncPipe'
import { EthereumRegistryContractAbi } from './EthereumRegistryContractAbi'

interface EthereumRegistryContractArguments {
  readonly rpcUrl?: string
  readonly contractAddress: string
  readonly privateKey: string
  readonly gasPrice?: number
  readonly chainId?: number
}

export interface EthereumRegistryContract {
  readonly accountAddress: string
  readonly close: () => void
  readonly getCidCount: () => Promise<number>
  readonly getCid: (index: number) => Promise<string>
  readonly addCid: (cid: string) => Promise<SendTransactionEvents>
  readonly onCidAdded: any
}

export interface SendTransactionEvents {
  readonly onTransactionHash: (callback: (transactionHash: string) => void) => void
  readonly onReceipt: (callback: (transactionReceipt: TransactionReceipt) => void) => void
  readonly onConfirmation: (
    callback: (confirmationNumber: number, transactionReceipt: TransactionReceipt) => void,
  ) => void
  readonly onError: (callback: (error: Error) => void) => void
}

// See https://github.com/ethereum/web3.js/issues/1547#issuecomment-558618977
const wrapTransactionReceiptPromiEvent = (
  transactionReceiptPromiEvent: PromiEvent<TransactionReceipt>,
): SendTransactionEvents => {
  const onTransactionHash = (callback: (transactionHash: string) => void) =>
    transactionReceiptPromiEvent.on('transactionHash', callback)
  const onReceipt = (callback: (transactionReceipt: TransactionReceipt) => void) =>
    transactionReceiptPromiEvent.on('receipt', callback)
  const onConfirmation = (callback: (confirmationNumber: number, transactionReceipt: TransactionReceipt) => void) =>
    transactionReceiptPromiEvent.on('confirmation', callback)
  const onError = (callback: (error: Error) => void) =>
    transactionReceiptPromiEvent.on('error', callback)

  return {
    onTransactionHash,
    onReceipt,
    onConfirmation,
    onError,
  }
}

const pickRawTransaction = ({ rawTransaction }: SignedTransaction) => rawTransaction

export const EthereumRegistryContract = ({
  rpcUrl = 'http://localhost:8545',
  contractAddress,
  privateKey,
  gasPrice = 1e9,
  chainId = 1984,
}: EthereumRegistryContractArguments): EthereumRegistryContract => {
  const web3 = new Web3(rpcUrl)
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  const contract = new web3.eth.Contract(EthereumRegistryContractAbi, contractAddress, { from: account.address })

  const close = () => {
    if (web3.currentProvider instanceof Web3.providers.WebsocketProvider)
      web3.currentProvider.disconnect(null, null)
  }

  const getCidCount = () => contract.methods.getCidCount().call().then(parseInt)

  const getCid = (index: number) => contract.methods.cids(index).call()

  const createTransaction = async (method: ContractSendMethod): Promise<TransactionConfig> => ({
    from: account.address,
    to: contractAddress,
    gas: await method.estimateGas(),
    gasPrice,
    data: method.encodeABI(),
    chainId,
    nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
  })

  const sendSignedTransaction = flow(
    web3.eth.sendSignedTransaction,
    wrapTransactionReceiptPromiEvent,
  )

  const createSignAndSendTransaction = asyncPipe(
    createTransaction,
    account.signTransaction,
    pickRawTransaction, // TODO: we need the transactionHash too, createSignAndSendTransaction should return it
    sendSignedTransaction,
  )

  const addCid = (cid: string) => createSignAndSendTransaction(contract.methods.addCid(cid))

  const onCidAdded = contract.events.CidAdded

  return {
    accountAddress: account.address,
    close,
    getCidCount,
    getCid,
    addCid,
    onCidAdded,
  }
}
