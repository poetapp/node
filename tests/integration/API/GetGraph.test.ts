/* tslint:disable:no-relative-imports */

import {
  configureCreateVerifiableClaim,
  createIssuerFromPrivateKey,
  getVerifiableClaimSigner,
  generateED25519Base58Keys, SignedVerifiableClaim,
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

  const getAndAssertGraph = async (uri: string, expectedGraph: ReadonlyArray<any>) => {
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
      should: 'return return an array',
      actual: Array.isArray(graph),
      expected: true,
    })

    assert({
      given: 'GET /graph',
      should: 'should return an array of expected length',
      actual: graph.length,
      expected: expectedGraph.length,
    })

    for (const expectedEdge of expectedGraph)
      assert({
        given: 'GET /graph',
        should: 'return 200',
        actual: graph.some((edge: any) => expectedEdge.origin === edge.origin && expectedEdge.target === edge.target),
        expected: true,
      })
  }

  const createClaims = async (rootAbout: string) => {
    const { privateKey } = generateED25519Base58Keys()
    const issuer = createIssuerFromPrivateKey(privateKey)

    const context = {
      about: {
        '@id': 'schema:url',
        '@container': '@list',
      },
      tracks: {
        '@id': 'schema:track',
        '@container': '@list',
      },
      datePublished: 'schema:datePublished',
    }

    const createSignedClaim = pipeP(
      configureCreateVerifiableClaim({ issuer, context }),
      VerifiableClaimSigner.configureSignVerifiableClaim({ privateKey }),
    )

    const ThePiperAtTheGatesOfDawnBySydBarrett = await createSignedClaim({
      name: 'The Piper at the Gates of Dawn',
      author: 'Syd Barrett',
      about: [
        rootAbout,
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
        rootAbout,
      ],
    })

    const ThePiperAtTheGatesOfDawnByPinkFloyd = await createSignedClaim({
      name: 'The Piper at the Gates of Dawn',
      author: 'Pink Floyd',
      about: [
        `poet:claims/${ThePiperAtTheGatesOfDawnBySydBarrett.id}`,
      ],
    })

    const ThePiperAtTheGatesOfDawnYear = await createSignedClaim({
      datePublished: '1967-08-04',
      about: [
        `poet:claims/${ThePiperAtTheGatesOfDawnByPinkFloyd.id}`,
      ],
    })

    return {
      ThePiperAtTheGatesOfDawnBySydBarrett,
      ThePiperAtTheGatesOfDawnByTrackListing,
      ThePiperAtTheGatesOfDawnByPinkFloyd,
      ThePiperAtTheGatesOfDawnYear,
    }
  }

  const postClaims = async (signedVerifiableClaims: ReadonlyArray<SignedVerifiableClaim>): Promise<void> => {
    for (const signedVerifiableClaim of signedVerifiableClaims) {
      await postWorkToNode(signedVerifiableClaim)
      await delay(500)
    }
  }

  {
    const wikiLink = 'https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn'

    const {
      ThePiperAtTheGatesOfDawnBySydBarrett,
      ThePiperAtTheGatesOfDawnByTrackListing,
      ThePiperAtTheGatesOfDawnByPinkFloyd,
      ThePiperAtTheGatesOfDawnYear,
    } = await createClaims(wikiLink)

    const signedVerifiableClaims = [
      ThePiperAtTheGatesOfDawnBySydBarrett,
      ThePiperAtTheGatesOfDawnByTrackListing,
      ThePiperAtTheGatesOfDawnByPinkFloyd,
      ThePiperAtTheGatesOfDawnYear,
    ]

    await postClaims(signedVerifiableClaims)

    await delay(2000)

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
      {
        origin: `poet:claims/${ThePiperAtTheGatesOfDawnYear.id}`,
        target: `poet:claims/${ThePiperAtTheGatesOfDawnByPinkFloyd.id}`,
      },
    ]

    await getAndAssertGraph(wikiLink, expectedGraph)
    for (const signedVerifiableClaim of signedVerifiableClaims)
      await getAndAssertGraph(`poet:claims/${signedVerifiableClaim.id}`, expectedGraph)
  }

  await server.stop()
  await db.teardown()
  await rabbitMQ.stop()
})
