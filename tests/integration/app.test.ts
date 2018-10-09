/* tslint:disable:no-relative-imports */
// IMPORTANT: If this fails due to the app not being able to flush it's
// event queue, this test will hang forever.
// Can we force the app to flush it's queue without killing the entire
// process (which would kill the test runner)?

import { describe } from 'riteway'
import { app } from '../../src/app'

process.env.API_PORT = '28080'
const asyncTimeout = (delay: number = 1) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(false), delay * 1000))

describe('gracefully stopping the application', async assert => {
  const delay = 5
  const server = await app()

  const actual = await Promise.race([server.stop(), asyncTimeout(delay)])

  assert({
    given: 'a running app',
    should: `exit within ${delay} seconds when stop() is called`,
    actual,
    expected: true,
  })
})
