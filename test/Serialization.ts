import { Expect, Test, TestCase } from 'alsatian'
import * as bitcore from 'bitcore-lib'
import { Message } from 'protobufjs'

import { Serialization } from '../src/Helpers/Serialization'
import { Claim, ClaimType, Work } from '../src/Interfaces'
import { ClaimProto, AttributeProto } from '../src/Serialization/PoetProto'

const theRaven: Work = {
  id: 'ecd1c878a3c47ff3a8e6654b73c6b68bf780f3611ce7c34c5fff9d7ac67edf69',
  publicKey: '',
  signature: '',
  type: ClaimType.Work,
  dateCreated: new Date(),
  attributes: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    content: 'Once upon a midnight dreary...'
  }
}

export class SerializationTest {

  @Test()
  @TestCase(theRaven)
  public claimId(work: Work) {
    const claimId = Serialization.getClaimId(work)
    Expect(claimId).toBe(work.id)
  }

  @Test()
  @TestCase(theRaven)
  public claimIdIgnoresId(work: Work) {
    // The field .id is ignored in the calculation of the id
    const ignoreId = Serialization.getClaimId({
      ...work,
      id: '123'
    })
    Expect(ignoreId).toBe(work.id)
  }

  @Test()
  @TestCase(theRaven)
  public claimIdIgnoresSignature(work: Work) {
    // The field .signature is ignored in the calculation of the id
    const ignoreSignature = Serialization.getClaimId({
      ...work,
      signature: '123'
    })
    Expect(ignoreSignature).toBe(work.id)
  }
}
