import { Connection, connect, Channel } from 'amqplib'

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

    this.connection.on('error', () => { console.log('error with rmq') })
    this.connection.on('close', () => { console.log('closing rmq') })

    this.channel = await this.connection.createChannel()
  }

  publish = async (exchange: Exchange, message: string | object): Promise<void> =>  {
    if (!this.channel)
      throw new Error('Cannot publish before calling start()')

    await this.channel.assertExchange(exchange, 'fanout', { durable: false })

    const messageString = typeof message === 'string'
      ? message
      : JSON.stringify(message)

    this.channel.publish(exchange, '', Buffer.from(messageString))
  }

  consume = async (exchange: Exchange, consume: (message: any) => void): Promise<void> => {
    const assertedExchange = await this.channel.assertExchange(exchange, 'fanout', { durable: false }) as any
    const assertQueue = await this.channel.assertQueue('', {exclusive: true})
    this.channel.bindQueue(assertQueue.queue, exchange, '')
    this.channel.consume(assertQueue.queue, consume, { noAck: true })
  }
}
