/* tslint:disable:no-console */
import { Connection, connect, Channel } from 'amqplib'
import { isClaim, ClaimIPFSHashPair, isClaimIPFSHashPair, PoetTimestamp } from 'poet-js'

import { Exchange } from './Messages'

export class Messaging {
  private readonly connectionUrl: string
  private connection: Connection
  private channel: Channel

  constructor(connectionUrl?: string) {
    this.connectionUrl = connectionUrl || 'amqp://localhost'
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

  publish = async (exchange: Exchange, message: string | object): Promise<void> => {
    if (!this.channel) throw new Error('Cannot publish before calling start()')

    await this.channel.assertExchange(exchange, 'fanout', { durable: false })

    const messageString = typeof message === 'string' ? message : JSON.stringify(message)

    this.channel.publish(exchange, '', Buffer.from(messageString))
  }

  consume = async (exchange: Exchange, consume: (message: any) => void): Promise<void> => {
    await this.channel.assertExchange(exchange, 'fanout', { durable: false })
    const assertQueue = await this.channel.assertQueue('', { exclusive: true })
    this.channel.bindQueue(assertQueue.queue, exchange, '')
    this.channel.consume(assertQueue.queue, consume, { noAck: true })
  }

  // TODO: move these business-specific functions to a different file
  publishPoetTimestampsDownloaded = async (poetTimestamps: ReadonlyArray<PoetTimestamp>) => {
    return this.publish(Exchange.PoetTimestampDownloaded, poetTimestamps)
  }

  consumePoetTimestampsDownloaded = async (consume: (poetTimestamps: ReadonlyArray<PoetTimestamp>) => void) => {
    await this.consume(Exchange.PoetTimestampDownloaded, (message: any) => {
      const messageContent = message.content.toString()
      const poetTimestamps = JSON.parse(messageContent)

      if (!Array.isArray(poetTimestamps)) {
        console.log({
          action: 'consumePoetTimestampsDownloaded',
          message: 'Expected poetTimestamps to be an Array.',
          poetTimestamps,
        })
        return
      }

      if (poetTimestamps.map(isClaim).find(_ => !_)) {
        console.log({
          action: 'consumePoetTimestampsDownloaded',
          message: 'Expected poetTimestamps to be an Array<Claim>.',
          offendingElements: poetTimestamps.map(isClaim).filter(_ => !_),
        })
        return
      }

      consume(poetTimestamps)
    })
  }

  publishClaimsDownloaded = async (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => {
    return this.publish(Exchange.ClaimsDownloaded, claimIPFSHashPairs)
  }

  consumeClaimsDownloaded = async (consume: (claimIPFSHashPairs: ReadonlyArray<ClaimIPFSHashPair>) => void) => {
    await this.consume(Exchange.ClaimsDownloaded, (message: any) => {
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
          action: 'consumePoetTimestampsDownloaded',
          message: 'Expected poetTimestamps to be an Array<ClaimIPFSHashPair>.',
          offendingElements: claimIPFSHashPairs.map(isClaimIPFSHashPair).filter(_ => !_),
        })
        return
      }

      consume(claimIPFSHashPairs)
    })
  }
}
