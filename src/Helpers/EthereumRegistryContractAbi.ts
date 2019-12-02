import { AbiItem } from 'web3-utils'

export const EthereumRegistryContractAbi: AbiItem[] = [
  {
    inputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'cid',
        type: 'string',
      },
      {
        indexed: false,
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'CidAdded',
    type: 'event',
  },
  {
    constant: true,
    inputs: [],
    name: '_owner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'cid',
        type: 'string',
      },
    ],
    name: 'addCid',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    name: 'cids',
    outputs: [
      {
        name: 'cid',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getCidCount',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

/*
Note: `internalType` properties were manually removed to match the type declaration.
See https://github.com/ethereum/web3.js/pull/3178
 */
