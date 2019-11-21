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
  readonly addCid: (cid: string) => any // Promise<PromiEvent<TransactionReceipt>>
  readonly onCidAdded: any
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

  const sendSignedTransaction = ({ rawTransaction }: any) => {
    const xxx = web3.eth.sendSignedTransaction(rawTransaction)
    console.log('xxx', xxx)

    xxx.on('transactionHash', (transactionHash: string) => {
        console.log(
          { transactionHash },
          '(claim + anchor receipt) transaction sent',
        )
      })
      .on('receipt', (receipt: any) => {
        console.log(
          { receipt },
          'Got receipt for (claim + anchor receipt) registry',
        )
      })
      .on('confirmation', (confirmationNumber: number, receipt: any) => {
        console.log(
          { confirmationNumber, receipt },
          'Got a confirmation for (claim + anchor receipt) registry',
        )
      })
      .on('error', (error : any) => {
        console.log(
          { error },
          'Error while registering (claim + anchor receipt) directory',
        )
      })

    return xxx
  }

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
