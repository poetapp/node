/* tslint:disable:no-console */
import { Connection, connect, Channel } from 'amqplib'

import { ClaimIPFSHashPair, isClaimIPFSHashPair, IPFSHashFailure, isIPFSHashFailure } from 'Interfaces'

import { ExchangeConfiguration } from './ExchangeConfiguration'
import { BlockDownloaded, isBlockDownloaded } from './Messages'

export class Messaging {
  private readonly connectionUrl: string
  private connection: Connection
  private channel: Channel
  private readonly exchanges: ExchangeConfiguration

  constructor(connectionUrl: string, exchanges: ExchangeConfiguration) {
    this.connectionUrl = connectionUrl
    this.exchanges = exchanges
  }

  start = async () => {
    try {
      this.connection = await connect(this.connectionUrl)
    } catch (ex) {
      throw new Error(`Unable to connect to RMQ at ${this.connectionUrl}. ${ex.message}`)
    }

    this.connection.on('error', () => {
      console.log('error with rmq')
    })
    this.connection.on('close', () => {
      console.log('closing rmq')
    })

    this.channel = await this.connection.createChannel()
  }

  stop = async () => {
    await this.connection.close()
  }

  publish = async (exchange: string, message: string | object): Promise<void> => {
    if (!this.channel) throw new Error('Cannot publish before calling start()')

    await this.channel.assertExchange(exchange, 'fanout', { durable: false })

    const messageString = typeof message === 'string' ? message : JSON.stringify(message)

    this.channel.publish(exchange, '', Buffer.from(messageString))
  }

  consume = async (exchange: string, consume: (message: any) => void): Promise<void> => {
    await this.channel.assertExchange(exchange, 'fanout', { durable: false })
    const assertQueue = await this.channel.assertQueue('', { exclusive: true })
    this.channel.bindQueue(assertQueue.queue, exchange, '')
    this.channel.consume(assertQueue.queue, consume, { noAck: true })
  }

  // TODO: move these business-specific functions to a different file. See https://github.com/poetapp/node/issues/66
  publishBlockDownloaded = async (blockDownloaded: BlockDownloaded) => {
    return this.publish(this.exchanges.poetAnchorDownloaded, blockDownloaded)
  }

  consumeBlockDownloaded = async (consume: (blockDownloaded: BlockDownloaded) => void) => {
    await this.consume(this.exchanges.poetAnchorDownloaded, (message: any) => {
      const messageContent = message.content.toString()
      const blockDownloaded = JSON.parse(messageContent) as unknown

      if (!isBlockDownloaded(blockDownloaded)) return

      consume(blockDownloaded)
    })
  }

  publishClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    return this.publish(this.exchanges.claimsDownloaded, claimIPFSHashPairs)
  }

  consumeClaimsDownloaded = async (consume: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => void) => {
    await this.consume(this.exchanges.claimsDownloaded, (message: any) => {
      const messageContent = message.content.toString()
      const claimIPFSHashPairs = JSON.parse(messageContent)

      if (!Array.isArray(claimIPFSHashPairs)) {
        console.log({
          action: 'consumeClaimsDownloaded',
          message: 'Expected claimIPFSHashPairs to be an Array.',
          claimIPFSHashPairs,
        })
        return
      }

      if (claimIPFSHashPairs.map(isClaimIPFSHashPair).find(_ => !_)) {
        console.log({
          action: 'consumeClaimsDownloaded',
          message: 'Expected claimIPFSHashPairs to be an Array<ClaimIPFSHashPair>.',
          offendingElements: claimIPFSHashPairs.map(isClaimIPFSHashPair).filter(_ => !_),
        })
        return
      }

      consume(claimIPFSHashPairs)
    })
  }

  publishClaimsNotDownloaded = async (ipfsHashFailure: ReadonlyArray<IPFSHashFailure>) => {
    return this.publish(this.exchanges.claimsNotDownloaded, ipfsHashFailure)
  }

  consumeClaimsNotDownloaded = async (consume: (ipfsHashFailures: ReadonlyArray<IPFSHashFailure>) => void) => {
    await this.consume(this.exchanges.claimsNotDownloaded, (message: any) => {
      const messageContent = message.content.toString()
      const ipfsHashFailures = JSON.parse(messageContent)

      if (!Array.isArray(ipfsHashFailures)) {
        console.log({
          action: 'consumeClaimsNotDownloaded',
          message: 'Expected ipfsHashFailures to be an Array.',
          ipfsHashFailures,
        })
        return
      }

      if (ipfsHashFailures.map(isClaimIPFSHashPair).find(_ => !_)) {
        console.log({
          action: 'consumeClaimsNotDownloaded',
          message: 'Expected ipfsHashFailures to be an Array<IPFSHashFailure>.',
          offendingElements: ipfsHashFailures.map(isIPFSHashFailure).filter(_ => !_),
        })
        return
      }

      consume(ipfsHashFailures)
    })
  }
}
