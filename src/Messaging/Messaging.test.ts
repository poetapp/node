import * as amqplib from 'amqplib'
import { describe } from 'riteway'
import { stub, spy } from 'sinon'
import { Exchange } from '../Messaging/Messages'
import { Messaging } from './Messaging'

const createStubConnect = () => {
  const assertExchange = spy()
  const publish = spy()
  const bindQueue = spy()
  const consume = spy()
  const assertQueue = stub().returns({ queue: 'queue' })
  const createChannel = stub()
  createChannel.returns({ assertExchange, publish, assertQueue, bindQueue, consume })

  const customEvents = {
    createChannel,
    on: () => {},
  }

  return {
    connect: () => Promise.resolve(customEvents),
    createChannel,
    assertExchange,
    publish,
    assertQueue,
    bindQueue,
    consume,
  }
}

describe('Messaging', async (should: any) => {
  const { assert } = should('')

  {
    const { connect, createChannel } = createStubConnect()
    const stubConnect = stub(amqplib, 'connect').callsFake(connect)
    const messaging = new Messaging()
    await messaging.start()

    assert({
      given: 'start() with valid connectionUrl',
      should: 'call createChannel()',
      actual: createChannel.calledOnce,
      expected: true,
    })
    stubConnect.restore()
  }

  {
    const messaging = new Messaging()
    const expected = 'Unable to connect to RMQ at amqp://localhost. connect ECONNREFUSED 127.0.0.1:5672'
    assert({
      given: 'start() with invalid connectionUrl',
      should: `return the error: ${expected}`,
      actual: await messaging.start().catch(e => e.message),
      expected,
    })
  }

  {
    const { connect, assertExchange, publish } = createStubConnect()
    const stubConnect = stub(amqplib, 'connect').callsFake(connect)
    const exchangers = Object.keys(Exchange)

    const messages = {
      likeString: 'New data',
      likeObject: { data: 'New data' },
    }

    for (const exchanger of exchangers) {
      for (const message of Object.values(messages)) {
        const mapMessage = typeof message === 'string' ? message : JSON.stringify(message)
        const messageBuffer = Buffer.from(mapMessage)
        const messaging = new Messaging()
        await messaging.start()
        await messaging.publish(exchanger as Exchange, message)

        assert({
          given: 'publish() when exists channel',
          should: `call channel.assertExchange() with ${exchanger}, fanout and { durable: false }`,
          actual: assertExchange.calledWith(exchanger, 'fanout', { durable: false }),
          expected: true,
        })

        assert({
          given: 'publish() when exists channel',
          should: `call channel.publish() with ${exchanger}, empty string and ${messageBuffer} as meesage`,
          actual: publish.calledWith(exchanger, '', messageBuffer),
          expected: true,
        })
      }
    }
    stubConnect.restore()
  }

  {
    const { connect, assertExchange, assertQueue, bindQueue, consume } = createStubConnect()
    const stubConnect = stub(amqplib, 'connect').callsFake(connect)

    const messaging = new Messaging()
    await messaging.start()
    await messaging.consume(Exchange.BatchReaderReadNextDirectoryRequest as Exchange, () => {})

    const exchangers = Object.keys(Exchange)
    for (const exchanger of exchangers) {
      const messaging = new Messaging()
      const consumeCallback = () => {}
      await messaging.start()
      await messaging.consume(exchanger as Exchange, consumeCallback)

      assert({
        given: 'consume() when exists channel',
        should: `call channel.assertExchange() with ${exchanger}, fanout and { durable: false }`,
        actual: assertExchange.calledWith(exchanger, 'fanout', { durable: false }),
        expected: true,
      })

      assert({
        given: 'consume() when exists channel',
        should: `call channel.assertQueue() with ${exchanger}, empty string and { exclusive: true }`,
        actual: assertQueue.calledWith('', { exclusive: true }),
        expected: true,
      })

      assert({
        given: 'consume() when exists channel',
        should: `call channel.bindQueue() with queue text, ${exchanger} and empty string`,
        actual: bindQueue.calledWith('queue', exchanger, ''),
        expected: true,
      })

      assert({
        given: 'consume() when exists channel',
        should: `call channel.consume() with queue text, consumeCallback and { noAck: true }`,
        actual: consume.calledWith('queue', consumeCallback, { noAck: true }),
        expected: true,
      })
    }
    stubConnect.restore()
  }
})
