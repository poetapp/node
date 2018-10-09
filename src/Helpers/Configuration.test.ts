import { describe } from 'riteway'

import { bitcoinRPCConfigurationToBitcoinCoreArguments, createEnvToConfigurationKeyMap } from './Configuration'

describe('createEnvToConfigurationKeyMap()', async (assert: any) => {
  assert({
    given: 'empty array',
    should: 'return empty object',
    actual: createEnvToConfigurationKeyMap([]),
    expected: {},
  })

  {
    const defaultConfiguration = ['rabbitmqUrl', 'mongodbHost', 'otherTestKeyMultipleCapital']

    assert({
      given: 'array with cammelCase values',
      should: 'return object with ScreamingSnakeCase keys and equal cammelCase values',
      actual: createEnvToConfigurationKeyMap(defaultConfiguration),
      expected: {
        RABBITMQ_URL: 'rabbitmqUrl',
        MONGODB_HOST: 'mongodbHost',
        OTHER_TEST_KEY_MULTIPLE_CAPITAL: 'otherTestKeyMultipleCapital',
      },
    })
  }
})

describe('bitcoinRPCConfigurationToBitcoinCoreArguments()', async (assert: any) => {
  const defaultConfiguration = {
    bitcoinUrl: '127.0.0.1',
    bitcoinPort: 18443,
    bitcoinNetwork: 'regtest',
    bitcoinUsername: 'bitcoinrpcuser',
    bitcoinPassword: 'bitcoinrpcpassword',
  }

  const expected = {
    host: defaultConfiguration.bitcoinUrl,
    port: defaultConfiguration.bitcoinPort,
    network: defaultConfiguration.bitcoinNetwork,
    username: defaultConfiguration.bitcoinUsername,
    password: defaultConfiguration.bitcoinPassword,
  }

  assert({
    given: 'defualt configuration',
    should: 'return bitcoin-core library compatible arguments',
    actual: bitcoinRPCConfigurationToBitcoinCoreArguments(defaultConfiguration),
    expected,
  })
})
