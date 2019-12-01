import { tap } from 'ramda'
import Web3 from 'web3'
import { SignedTransaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import { ContractSendMethod } from 'web3-eth-contract'

import { EthereumRegistryContractAbi } from './EthereumRegistryContractAbi'
import { asyncPipe } from './asyncPipe'

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
  readonly addCid: (cid: string) => Promise<string>
  readonly onCidAdded: any
  readonly getTransactionReceipt: (hash: string) => Promise<TransactionReceipt>
}

const pickRawTransaction = (_: SignedTransaction) => _.rawTransaction
const pickTransactionHash = (_: SignedTransaction) => _.transactionHash

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

  const createSignAndSendTransaction = asyncPipe(
    createTransaction,
    account.signTransaction,
    tap(asyncPipe(
      pickRawTransaction,
      web3.eth.sendSignedTransaction,
    )),
    pickTransactionHash,
  )

  const addCid = (cid: string) => createSignAndSendTransaction(contract.methods.addCid(cid))

  const onCidAdded = contract.events.CidAdded

  const getTransactionReceipt = web3.eth.getTransactionReceipt

  return {
    accountAddress: account.address,
    close,
    getCidCount,
    getCid,
    addCid,
    onCidAdded,
    getTransactionReceipt,
  }
}
