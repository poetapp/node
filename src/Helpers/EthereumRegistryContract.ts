import Web3 from 'web3'

import { EthereumRegistryContractAbi } from './EthereumRegistryContractAbi'
import { PromiEvent, TransactionReceipt } from 'web3-core'

interface EthereumRegistryContractArguments {
  readonly rpcUrl?: string
  readonly contractAddress: string
  readonly privateKey: string
  readonly gasPrice?: number
  readonly chainId?: number
}

export interface EthereumRegistryContract {
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
    callback: (confirmationNumber: number, transactionReceipt: TransactionReceipt) => void
  ) => void
  readonly onError: (callback: (error: Error) => void) => void
}

const wrapTransactionReceiptPromiEvent = (
  signedTransactionReceiptPromiEvent: PromiEvent<TransactionReceipt>
): SendTransactionEvents => {
  const onTransactionHash = (callback: (transactionHash: string) => void) =>
    signedTransactionReceiptPromiEvent.on('transactionHash', callback)
  const onReceipt = (callback: (transactionReceipt: TransactionReceipt) => void) =>
    signedTransactionReceiptPromiEvent.on('receipt', callback)
  const onConfirmation = (callback: (confirmationNumber: number, transactionReceipt: TransactionReceipt) => void) =>
    signedTransactionReceiptPromiEvent.on('confirmation', callback)
  const onError = (callback: (error: Error) => void) =>
    signedTransactionReceiptPromiEvent.on('error', callback)

  return {
    onTransactionHash,
    onReceipt,
    onConfirmation,
    onError,
  }
}

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

  console.log('instantiating EthRegContract', account) // TODO: remove comment

  const close = () => {
    if (web3.currentProvider instanceof Web3.providers.WebsocketProvider)
      web3.currentProvider.disconnect(null, null)
  }

  const getCidCount = () => contract.methods.getCidCount().call().then(parseInt)

  const getCid = (index: number) => contract.methods.cids(index).call()

  const createSignedTransaction = async (method: any) => {
    const tx = {
      from: account.address,
      to: contractAddress,
      gas: await method.estimateGas(),
      gasPrice,
      data: method.encodeABI(),
      chainId,
      nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
    }

    return account.signTransaction(tx)
  }

  const sendSignedTransaction = ({ rawTransaction }: any) =>
    wrapTransactionReceiptPromiEvent(web3.eth.sendSignedTransaction(rawTransaction))

  const createSignAndSendTransaction = (method: any) =>
    createSignedTransaction(method)
      .then(sendSignedTransaction)

  const addCid = (cid: string) => createSignAndSendTransaction(contract.methods.addCid(cid))

  const onCidAdded = contract.events.CidAdded

  return {
    close,
    getCidCount,
    getCid,
    addCid,
    onCidAdded,
  }
}
