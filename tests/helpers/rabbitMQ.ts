/* tslint:disable:no-console */
/* tslint:disable:no-relative-imports */
import { connect } from 'amqplib'

export const RabbitMQ = async () => {
  console.log(`Connecting to RabbitMQ...`)
  const connection = await connect(process.env.RABBITMQ_URL)

  return {
    consume: (exchange: string, callback: (message: any) => Promise<void>) => consume(connection, exchange, callback),
    stop: () => stop(connection),
  }
}

const consume = async (connection: any, exchange: string, consume: (message: any) => Promise<void>) => {
  const channel = await connection.createChannel()
  await channel.assertExchange(exchange, 'fanout', { durable: false })
  const assertQueue = await channel.assertQueue('', { exclusive: true })
  channel.bindQueue(assertQueue.queue, exchange, '')

  channel.consume(assertQueue.queue, consume)
}

const stop = async (connection: any) => {
  console.log(`Closing to RabbitMQ...`)
  await connection.close()
}
