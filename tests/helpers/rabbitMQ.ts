import { connect, ConsumeMessage } from 'amqplib'

type ConsumeCallback = (message: ConsumeMessage) => Promise<void>
interface RabbitMQ {
  readonly consume: (exchange: string, callback: ConsumeCallback) => Promise<void>
  readonly stop: () => Promise<void>
}

export const RabbitMQ = async (rabbitUrl: string): Promise<RabbitMQ> => {
  const connection = await connect(rabbitUrl)

  const consume = async (exchange: string, consume: ConsumeCallback) => {
    const channel = await connection.createChannel()
    await channel.assertExchange(exchange, 'fanout', { durable: false })
    const assertQueue = await channel.assertQueue('', { exclusive: true })
    channel.bindQueue(assertQueue.queue, exchange, '')

    channel.consume(assertQueue.queue, consume)
  }

  const stop = async () => {
    await connection.close()
  }

  return {
    consume,
    stop,
  }
}
