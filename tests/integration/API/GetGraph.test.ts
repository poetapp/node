/* tslint:disable:no-relative-imports */
import { randomBytes } from 'crypto'

import { configureCreateVerifiableClaim, createIssuerFromPrivateKey, getVerifiableClaimSigner } from '@po.et/poet-js'
import * as bs58 from 'bs58'
import { pipe, pipeP } from 'ramda'
import { describe } from 'riteway'

import { delay, runtimeId, setUpServerAndDb } from '../../helpers/utils'
import { getWork, postWork } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const getWorkFromNode = getWork(NODE_PORT)
const postWorkToNode = postWork(NODE_PORT)


describe('GET /graph', async assert => {
  // const { db, server, rabbitMQ } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  const VerifiableClaimSigner = getVerifiableClaimSigner()

  {
    const privateKey = bs58.encode(randomBytes(64))
    const issuer = createIssuerFromPrivateKey(privateKey)

    const context = {
      about: 'schema:url',
      tracks: 'schema:url',
    }

    const createSignedClaim = pipeP(
      configureCreateVerifiableClaim({ issuer, context }),
      VerifiableClaimSigner.configureSignVerifiableClaim({ privateKey }),
    )

    const ThePiperAtTheGatesOfDawnBySydBarrett = await createSignedClaim({
      name: 'The Piper at the Gates of Dawn',
      author: 'Syd Barrett',
      about: [
        'https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn',
      ],
    })

    const ThePiperAtTheGatesOfDawnByTrackListing = await createSignedClaim({
      tracks: [
        'Astronomy Domine',
        'Lucifer Sam',
        'Matilda Mother',
        'Flaming',
        'Pow R. Toc H.',
        'Take Up Thy Stethoscope and Walk',
        'Interstellar Overdrive',
        'The Gnome',
        'Chapter 24',
        'The Scarecrow',
        'Bike',
      ],
      about: [
        'https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn',
      ],
    })

    const ThePiperAtTheGatesOfDawnByPinkFloyd = await createSignedClaim({
      name: 'The Piper at the Gates of Dawn',
      author: 'Pink Floyd',
      about: [
        `poet:claims/${ThePiperAtTheGatesOfDawnBySydBarrett.id}`,
      ],
    })

    // console.log(JSON.stringify(ThePiperAtTheGatesOfDawnBySydBarrett, null, 2))
    // console.log(JSON.stringify(ThePiperAtTheGatesOfDawnByTrackListing, null, 2))
    // console.log(JSON.stringify(ThePiperAtTheGatesOfDawnByPinkFloyd, null, 2))

    assert({
      given: 'GET /graph',
      should: 'return 202',
      actual: 1,
      expected: 1,
    })

    // await postWorkToNode(ABraveAndStartlingTruth)
    // await delay(5000)
    // await postWorkToNode(ABraveAndStartlingTruth)
    // await delay(5000)
    // await postWorkToNode(ABraveAndStartlingTruth)
    // await delay(5000)

  }

  // await server.stop()
  // await db.teardown()
  // await rabbitMQ.stop()
})
