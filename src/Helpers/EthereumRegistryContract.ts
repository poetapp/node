import Web3 from 'web3'

import * as EthereumRegistryContractAbi from './EthereumRegistryContractAbi.json'

interface EthereumRegistryContractArguments {
  readonly web3host: string
  readonly contractAddress: string
  readonly privateKey: string
  readonly gasPrice: number
  readonly chainId: number
}

export const EthereumRegistryContract = ({
  web3host,
  contractAddress,
  privateKey,
  gasPrice = 1e9,
  chainId = 1984,
}: EthereumRegistryContractArguments) => {
  const web3 = new Web3(web3host)
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  const contract = new web3.eth.Contract(EthereumRegistryContractAbi as any, contractAddress, { from: account.address })

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

    return web3.eth.sendSignedTransaction(rawTransaction)
  }

  return {
    getCidCount,
    getCid,
    addCid,
  }
}
