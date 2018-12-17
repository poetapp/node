
import { describe } from 'riteway'
import { FailureReason } from './DownloadFailure'
import {
  NoMoreEntriesException,
  InvalidClaim,
  IPFSGenericError,
  IPFSTimeoutError,
  errorToIPFSError,
} from './Exceptions'

class FetchTimeoutError extends Error {
  readonly type: string

  constructor(type: string) {
    super()
    this.name = 'FetchError'
    this.type = type
  }
}

describe('src/StorageReader/Exceptions', async assert => {

  {
    const noMoreEntriesException = new NoMoreEntriesException('noMoreEntriesException')
    const parseError = JSON.parse(JSON.stringify(noMoreEntriesException))
    const actual = parseError.message
    const expected = 'noMoreEntriesException'

    assert({
      given: 'a NoMoreEntriesException',
      should: 'be the message property noMoreEntriesException',
      actual,
      expected,
    })
  }

  {
    const ipfsFileHash = 'ipfsFileHash'
    const failureReason = FailureReason.IPFSGeneric
    const failureTime = new Date().getTime()

    const invalidClaim = new InvalidClaim(ipfsFileHash, failureReason, failureTime)
    const parseError = JSON.parse(JSON.stringify(invalidClaim))

    const actual = {
      ipfsFileHash: parseError.ipfsFileHash,
      failureReason: parseError.failureReason,
      failureTime: parseError.failureTime,
      message: parseError.message,
      type: parseError.type,
    }

    const expected = {
      ipfsFileHash,
      failureReason,
      failureTime,
      message: '',
      type: 'InvalidClaim',
    }

    assert({
      given: 'a InvalidClaim',
      should: 'return all properties of an InvalidClaim Error',
      actual,
      expected,
    })
  }

  {
    const ipfsFileHash = 'ipfsFileHash'
    const failureReason = FailureReason.IPFSGeneric

    const invalidClaim = new InvalidClaim(ipfsFileHash, failureReason)
    const parseError = JSON.parse(JSON.stringify(invalidClaim))

    const actual = typeof(parseError.failureTime)
    const expected = 'number'

    assert({
      given: 'a failureTime undefined on InvalidClaim',
      should: 'return failureTime like a number',
      actual,
      expected,
    })
  }

  {
    const ipfsFileHash = 'ipfsFileHash'
    const underlyingError = new Error('error')
    const failureTime = new Date().getTime()

    const ipfsGenericError = new IPFSGenericError(ipfsFileHash, underlyingError, failureTime)
    const parseError = JSON.parse(JSON.stringify(ipfsGenericError))

    const actual = {
      ipfsFileHash: parseError.ipfsFileHash,
      underlyingError: parseError.underlyingError.message,
      failureTime: parseError.failureTime,
      message: parseError.message,
      type: parseError.type,
    }

    const expected = {
      ipfsFileHash,
      underlyingError: underlyingError.message,
      failureTime,
      message: '',
      type: 'IPFSGenericError',
    }

    assert({
      given: 'a IPFSGenericError',
      should: 'return all properties of an IPFSGenericError Error',
      actual,
      expected,
    })
  }

  {
    const ipfsFileHash = 'ipfsFileHash'
    const failureTime = new Date().getTime()

    const ipfsTimeoutError = new IPFSTimeoutError(ipfsFileHash, failureTime)
    const parseError = JSON.parse(JSON.stringify(ipfsTimeoutError))

    const actual = {
      ipfsFileHash: parseError.ipfsFileHash,
      failureTime: parseError.failureTime,
      message: parseError.message,
      type: parseError.type,
    }

    const expected = {
      ipfsFileHash,
      failureTime,
      message: '',
      type: 'IPFSTimeoutError',
    }

    assert({
      given: 'a IPFSTimeoutError',
      should: 'return all properties of an IPFSTimeoutError Error',
      actual,
      expected,
    })
  }

  {
    const ipfsFileHash = 'ipfsFileHash'
    const customError = new Error()
    const error = errorToIPFSError(ipfsFileHash)(customError)

    const actual = JSON.parse(JSON.stringify(error)).type
    const expected = 'IPFSGenericError'

    assert({
      given: 'a any type Error for errorToIPFSError',
      should: 'return a IPFSGenericError type error',
      actual,
      expected,
    })
  }

  {
    const ipfsFileHash = 'ipfsFileHash'
    const fetchError = new FetchTimeoutError('request-timeout')
    const error = errorToIPFSError(ipfsFileHash)(fetchError)

    const actual = JSON.parse(JSON.stringify(error)).type
    const expected = 'IPFSTimeoutError'

    assert({
      given: 'a IPFSTimeoutError for errorToIPFSError',
      should: 'return a IPFSTimeoutError type error',
      actual,
      expected,
    })
  }
})
