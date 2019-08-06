/* tslint:disable:no-relative-imports */

import {
  configureCreateVerifiableClaim,
  createIssuerFromPrivateKey,
  getVerifiableClaimSigner,
  generateED25519Base58Keys,
} from '@po.et/poet-js'
import { pipeP } from 'ramda'
import { describe } from 'riteway'

import { delay, runtimeId, setUpServerAndDb } from '../../helpers/utils'
import { postWork, getGraph } from '../../helpers/works'

const PREFIX = `test-functional-node-poet-${runtimeId()}`
const NODE_PORT = '28081'
const postWorkToNode = postWork(NODE_PORT)
const postGraphToNode = getGraph(NODE_PORT)

describe('GET /graph', async assert => {
  const { db, server, rabbitMQ } = await setUpServerAndDb({ PREFIX, NODE_PORT })

  const VerifiableClaimSigner = getVerifiableClaimSigner()

  const getAndAssertGraph = async (uri: string, expectedGraph: any) => {
    const graphResponse = await postGraphToNode(uri)

    assert({
      given: 'GET /graph',
      should: 'return 202',
      actual: graphResponse.ok,
      expected: true,
    })

    const graph = await graphResponse.json()

    assert({
      given: 'GET /graph',
      should: 'return 200',
      actual: graph,
      expected: expectedGraph,
    })
  }

  {
    const wikiLink = 'https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn'
    const { privateKey } = generateED25519Base58Keys()
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
        wikiLink,
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
        wikiLink,
      ],
    })

    const ThePiperAtTheGatesOfDawnByPinkFloyd = await createSignedClaim({
      name: 'The Piper at the Gates of Dawn',
      author: 'Pink Floyd',
      about: [
        `poet:claims/${ThePiperAtTheGatesOfDawnBySydBarrett.id}`,
      ],
    })

    await postWorkToNode(ThePiperAtTheGatesOfDawnBySydBarrett)
    await delay(1000)
    await postWorkToNode(ThePiperAtTheGatesOfDawnByTrackListing)
    await delay(1000)
    await postWorkToNode(ThePiperAtTheGatesOfDawnByPinkFloyd)
    await delay(5000)

    const expectedGraph = [
      {
        origin: `poet:claims/${ThePiperAtTheGatesOfDawnBySydBarrett.id}`,
        target: wikiLink,
      },
      {
        origin: `poet:claims/${ThePiperAtTheGatesOfDawnByTrackListing.id}`,
        target: wikiLink,
      },
      {
        origin: `poet:claims/${ThePiperAtTheGatesOfDawnByPinkFloyd.id}`,
        target: `poet:claims/${ThePiperAtTheGatesOfDawnBySydBarrett.id}`,
      },
    ]

    await getAndAssertGraph(wikiLink, expectedGraph)
  }

  await server.stop()
  await db.teardown()
  await rabbitMQ.stop()
})
