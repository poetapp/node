import { pick } from 'ramda'
import { describe } from 'riteway'
import '../Extensions/Error'
import { FetchErrorType } from '../Helpers/FetchError'
import { FailureReason } from './DownloadFailure'
import {
  NoMoreEntriesException,
  InvalidClaim,
  IPFSGenericError,
  IPFSTimeoutError,
  errorToIPFSError,
} from './Exceptions'

class FetchError extends Error {
  readonly type: string

  constructor() {
    super()
    this.name = 'FetchError'
    this.type = FetchErrorType.BodyTimeout
  }
}

describe('Exceptions NoMoreEntriesException', async (should: any) => {
  const { assert } = should('')

  {
    const noMoreEntriesException = new NoMoreEntriesException('NoMoreEntriesException')

    assert({
      given: 'the new instance of NoMoreEntriesException',
      should: 'be an instance of NoMoreEntriesException',
      actual: noMoreEntriesException instanceof NoMoreEntriesException,
      expected: true,
    })

    const actual = JSON.parse(JSON.stringify(noMoreEntriesException)).message
    const expected = 'NoMoreEntriesException'

    assert({
      given: 'the new instance of NoMoreEntriesException',
      should: 'return the message NoMoreEntriesException',
      actual,
      expected,
    })
  }
})

describe('Exceptions InvalidClaim', async (should: any) => {
  const { assert } = should('')

  {
    const invalidClaim = new InvalidClaim('ipfsFileHash', FailureReason.InvalidClaim)

    assert({
      given: 'the new instance of InvalidClaim',
      should: 'be an instance of InvalidClaim',
      actual: invalidClaim instanceof InvalidClaim,
      expected: true,
    })

    const actual = pick(['ipfsFileHash', 'failureReason'], JSON.parse(JSON.stringify(invalidClaim)))
    const expected = { ipfsFileHash: 'ipfsFileHash', failureReason: FailureReason.InvalidClaim }

    assert({
      given: 'the new instance of InvalidClaim',
      should: 'return the keys ipfsFileHash with the value ipfsFileHash and failureReason with the value INVALID_CLAIM',
      actual,
      expected,
    })
  }
})

describe('Exceptions IPFSGenericError', async (should: any) => {
  const { assert } = should('')

  {
    const underlyingError = new Error('underlyingError')
    const ipfsGenericError = new IPFSGenericError('ipfsFileHash', underlyingError)

    assert({
      given: 'the new instance of IPFSGenericError',
      should: 'be an instance of IPFSGenericError',
      actual: ipfsGenericError instanceof IPFSGenericError,
      expected: true,
    })

    const actual = pick(['ipfsFileHash'], JSON.parse(JSON.stringify(ipfsGenericError)))
    const expected = { ipfsFileHash: 'ipfsFileHash' }

    assert({
      given: 'the new instance of IPFSGenericError',
      should: 'return the key ipfsFileHash with the value ipfsFileHash',
      actual,
      expected,
    })
  }
})

describe('Exceptions IPFSTimeoutError', async (should: any) => {
  const { assert } = should('')

  {
    const ipfsTimeoutError = new IPFSTimeoutError('ipfsFileHash')

    assert({
      given: 'the new instance of IPFSTimeoutError',
      should: 'be an instance of IPFSTimeoutError',
      actual: ipfsTimeoutError instanceof IPFSTimeoutError,
      expected: true,
    })

    const actual = pick(['ipfsFileHash'], JSON.parse(JSON.stringify(ipfsTimeoutError)))
    const expected = { ipfsFileHash: 'ipfsFileHash' }

    assert({
      given: 'the new instance of IPFSTimeoutError',
      should: 'return the key ipfsFileHash with the value ipfsFileHash',
      actual,
      expected,
    })
  }
})

describe('Exceptions errorToIPFSError', async (should: any) => {
  const { assert } = should('')

  {
    const error = new Error()
    const errorToIPFS = errorToIPFSError('ipfsFileHash')

    assert({
      given: 'errorToIPFSError() with whatever error',
      should: 'return a new instance of IPFSGenericError',
      actual: errorToIPFS(error) instanceof IPFSGenericError,
      expected: true,
    })

    const fetchError = new FetchError()

    assert({
      given: 'errorToIPFSError() with FetchError',
      should: 'return a new instance of IPFSTimeoutError',
      actual: errorToIPFS(fetchError) instanceof IPFSTimeoutError,
      expected: true,
    })
  }
})
