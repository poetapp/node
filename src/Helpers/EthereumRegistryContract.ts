import Web3 from 'web3'
import { WebsocketProvider } from 'web3-core'

import { EthereumRegistryContractAbi } from './EthereumRegistryContractAbi'

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
  readonly addCid: (cid: string) => Promise<void>
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

  const close = () => {
    (web3.currentProvider as any).disconnect()
  }

  // if (web3.currentProvider instanceof Web3.providers.WebsocketProvider)
  //   console.log('web3.currentProvider', web3.currentProvider.disconnect)
  // else
  //   console.log('web3.currentProvider', 'wtf', web3.currentProvider)
  //

  const getCidCount = () => contract.methods.getCidCount().call().then(parseInt)

  const getCid = (index: number) => contract.methods.cids(index).call()

  const addCid = async (cid: string) => {
    const method = contract.methods.addCid(cid)

    const tx = {
      from: account.address,
      to: contractAddress,
      gas: await method.estimateGas(),
      gasPrice,
      data: method.encodeABI(),
      chainId,
      nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
    }

    const { rawTransaction } = await account.signTransaction(tx)

    await web3.eth.sendSignedTransaction(rawTransaction)
  }

  const onCidAdded = contract.events.CidAdded

  return {
    close,
    getCidCount,
    getCid,
    addCid,
    onCidAdded,
  }
}
