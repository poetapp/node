/* tslint:disable:no-console */
import { isSignedVerifiableClaim, PoetBlockAnchor } from '@po.et/poet-js'
import { Connection, connect, Channel } from 'amqplib'

import { ClaimIPFSHashPair, isClaimIPFSHashPair } from 'Interfaces'

import { ExchangeConfiguration } from './ExchangeConfiguration'

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
  publishPoetBlockAnchorsDownloaded = async (poetBlockAnchors: ReadonlyArray<PoetBlockAnchor>) => {
    return this.publish(this.exchanges.poetAnchorDownloaded, poetBlockAnchors)
  }

  consumeBlockAnchorsDownloaded = async (consume: (poetBlockAnchors: ReadonlyArray<PoetBlockAnchor>) => void) => {
    await this.consume(this.exchanges.poetAnchorDownloaded, (message: any) => {
      const messageContent = message.content.toString()
      const poetBlockAnchors = JSON.parse(messageContent)

      if (!Array.isArray(poetBlockAnchors)) {
        console.log({
          action: 'consumeBlockAnchorsDownloaded',
          message: 'Expected poetBlockAnchors to be an Array.',
          poetBlockAnchors,
        })
        return
      }

      if (poetBlockAnchors.map(isSignedVerifiableClaim).find(_ => !_)) {
        console.log({
          action: 'consumeBlockAnchorsDownloaded',
          message: 'Expected poetBlockAnchors to be an Array<Claim>.',
          offendingElements: poetBlockAnchors.map(isSignedVerifiableClaim).filter(_ => !_),
        })
        return
      }

      consume(poetBlockAnchors)
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
}
