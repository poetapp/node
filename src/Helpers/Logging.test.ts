import { EventEmitter } from 'events'
import * as Pino from 'pino'
import { describe } from 'riteway'
import { spy } from 'sinon'
import {
  createModuleLogger,
  childWithModuleName,
  childWithFileName,
  loggingConfigurationToPinoConfiguration,
} from './Logging'

const configuration = {
  loggingLevel: 'debug',
  loggingPretty: true,
}

const CustomPino = Object.create(Pino)
CustomPino.child = spy()

describe('Logging', async (assert: any) => {
  {
    const logger = createModuleLogger(configuration, __dirname)

    assert({
      given: 'createModuleLogger(configuration, __dirname)',
      should: 'return instance with EventEmitter as prototype',
      actual: EventEmitter.prototype.isPrototypeOf(logger),
      expected: true,
    })
  }

  {
    childWithModuleName(CustomPino, 'directory')

    assert({
      given: `childWithModuleName(CustomPino, 'directory')`,
      should: `call once child of CustomPino with { module: 'directory' }`,
      actual: CustomPino.child.calledWith({ module: 'directory' }),
      expected: true,
    })
  }

  {
    childWithFileName(CustomPino, 'file.ts')

    assert({
      given: `childWithFileName(CustomPino, 'file')`,
      should: `call once child of CustomPino with { file: 'file' }`,
      actual: CustomPino.child.calledWith({ file: 'file' }),
      expected: true,
    })
  }

  {
    const actual = loggingConfigurationToPinoConfiguration(configuration)

    assert({
      given: 'a LoggingConfiguration',
      should: 'loggingConfigurationToPinoConfiguration return an object with level and prettyPrint',
      actual: actual.level === 'debug' && actual.prettyPrint === true,
      expected: true,
    })
  }
})
