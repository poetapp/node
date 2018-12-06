/* tslint:disable:no-console */
/* tslint:disable:no-relative-imports */
import { connect, ConsumeMessage, Connection } from 'amqplib'

export const RabbitMQ = async (rabbitUrl: string) => {
  console.log(`Connecting to RabbitMQ...`)
  const connection = await connect(rabbitUrl)

  return {
    consume: (
      exchange: string,
      callback: (message: ConsumeMessage) => Promise<void>,
    ) => consume(connection, exchange, callback),
    stop: () => stop(connection),
  }
}

const consume = async (
    connection: Connection,
    exchange: string,
    consume: (message: ConsumeMessage) => Promise<void>,
  ) => {
  const channel = await connection.createChannel()
  await channel.assertExchange(exchange, 'fanout', { durable: false })
  const assertQueue = await channel.assertQueue('', { exclusive: true })
  channel.bindQueue(assertQueue.queue, exchange, '')

  channel.consume(assertQueue.queue, consume)
}

const stop = async (connection: Connection) => {
  console.log(`Closing RabbitMQ connection...`)
  await connection.close()
}
