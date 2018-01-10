import { ClaimAttributes, ClaimType, Work } from 'poet-js'

export const TheRaven: Work = {
  id: '1bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '3045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed91034',
  type: ClaimType.Work,
  dateCreated: new Date('2017-11-13T15:00:00.000Z'),
  attributes: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
    content: 'Once upon a midnight dreary...'
  }
}

export const TheMurdersInTheRueMorgue: Work = {
  id: '15867401b92567b4f7ea83e39a646ab9eb581b560bc78488b7a0c1b586c70215',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '304402201824b78d3703162eb7f240341968ebfecad1f002f988dbc9ec80c1317e49d6290220470124c7425a5d8024778991863f0a25931a7e45fb72223bea81728a08e30b50',
  type: ClaimType.Work,
  dateCreated: new Date('2017-12-11T22:58:11.375Z'),
  attributes: {
    name: 'The Murders in the Rue Morgue',
    author: 'Edgar Allan Poe',
    tags: 'short story, detective story, detective',
    dateCreated: '1841-01-01T00:00:00.000Z',
    datePublished: '1841-01-01T00:00:00.000Z',
    content: 'The mental features discoursed of as the analytical, are, in themselves, but little susceptible of analysis...'
  }
}

export const AStudyInScarlet: Work = {
  id: '33ebc219caa62d07e3f27f891620d24499e53811b81f72762f6240d7b92dcbf3',
  publicKey: '02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d',
  signature: '3045022100df2034f6e8dd277cbbddfff3652d50ec0b7a59f385e3f68df188e290be77a88302201856b5d8cc07c7726afc41cc0f6f67eabd5ea23a413dcbbbdc1047285f1a2150',
  type: ClaimType.Work,
  dateCreated: new Date('2017-12-11T22:58:11.327Z'),
  attributes: {
    name: 'A Study in Scarlet',
    author: 'Arthur Conan Doyle',
    tags: 'detective novel, detective',
    dateCreated: '1886-01-01T00:00:00.000Z',
    datePublished: '1887-01-01T00:00:00.000Z',
    content: 'In the year 1878 I took my degree of Doctor of Medicine of the University of London...'
  }
}

export const TheRavenHex = '0a201bb5e7959c7cb28936ec93eb6893094241a5bc396f08845b4f52c86034f0ddf8122102badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd21a473045022100e020a7ffeffa5d40ffde618c6c861678e38de69fd377028ec57ad93893883b3702201f085284a9064bab7e1cd39349e65d136d8f67e4b6b897c3e7db6b400ed910342204576f726b2880db93affb2b32190a06617574686f72120f456467617220416c6c616e20506f6532290a07636f6e74656e74121e4f6e63652075706f6e2061206d69646e69676874206472656172792e2e2e320f0a0b6461746563726561746564120032290a0d646174657075626c69736865641218313834352d30312d32395430333a30303a30302e3030305a32110a046e616d65120954686520526176656e320c0a04746167731204706f656d'

export const PrivateKeyEAP = 'KxuZJmgVAipi9hfYXHTyGYmmhkbG7fBzmkyVnj6t9j9rDR1nN1vN'
export const PrivateKeyACD = 'cPtZVYmMDT4aLm9inqXG9N8HQhAD5GgM8LuXZUbbFcqZTTcvQSP9'

export function makeClaim(attributes: ClaimAttributes) {
  const dateCreated = new Date('2017-12-11T22:54:40.261Z')
  const publicKey = '02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d'
  const type = ClaimType.Work
  return {
    publicKey,
    dateCreated,
    type,
    attributes,
  }
}
