import { ClaimType, Work } from 'Interfaces'

export const TheRaven: Work = {
  id: '10d61d594df81c8018604e2bb0cb1e798ce18675812445e0248db4819e558187',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '3045022100bcc3051ac599ac074bac88e9df4cde39dd8eaf3e98dbd8f631f317392375cdd7022074818bc2d6a56a1bf619286b8639efc037177dda6b6843d1a089b8918c82a793',
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
  id: '59b039e521c65b085f8bfbbf46c3d1d61bf9516a5883a642ddf8a7dac42c6ae6',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '304402200a89e65568a67f573ce4d5f1ffa814f9bb405741785aee00aa183f76891a548b022000dd031969bfccbdb8e3bd1dc49e3bd19e7345a59fbf9ef5731f5fdbd72f6c78',
  type: ClaimType.Work,
  dateCreated: new Date('2017-12-11T21:06:53.168Z'),
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
  id: '2171c72c9f462ecd0959eb9f685830193bc8964cd1e937d2f2867f7585e0e2b8',
  publicKey: '02db393ae2d566ceddd95a97fd88bc2897a0818528158261cec45087a58786f09d',
  signature: '304402207b58522782370426ebf2003b1704c8b2703cd0f360fa0cec5cb2d7393bb8639602202c2b0dce0ad3f9caf809f5606d4ffd4ddfb46d7c1996491512cb9e024075c9fe',
  type: ClaimType.Work,
  dateCreated: new Date('2017-12-11T21:06:53.124Z'),
  attributes: {
    name: 'A Study in Scarlet',
    author: 'Arthur Conan Doyle',
    tags: 'detective novel, detective',
    dateCreated: '1886-01-01T00:00:00.000Z',
    datePublished: '1887-01-01T00:00:00.000Z',
    content: 'In the year 1878 I took my degree of Doctor of Medicine of the University of London...'
  }
}

export const TheRavenHex = '0a2010d61d594df81c8018604e2bb0cb1e798ce18675812445e0248db4819e558187122102badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd21a473045022100bcc3051ac599ac074bac88e9df4cde39dd8eaf3e98dbd8f631f317392375cdd7022074818bc2d6a56a1bf619286b8639efc037177dda6b6843d1a089b8918c82a7932204576f726b2880db93affb2b32110a046e616d65120954686520526176656e32190a06617574686f72120f456467617220416c6c616e20506f65320c0a04746167731204706f656d320f0a0b6461746543726561746564120032290a0d646174655075626c69736865641218313834352d30312d32395430333a30303a30302e3030305a32290a07636f6e74656e74121e4f6e63652075706f6e2061206d69646e69676874206472656172792e2e2e'

export const PrivateKeyEAP = 'KxuZJmgVAipi9hfYXHTyGYmmhkbG7fBzmkyVnj6t9j9rDR1nN1vN'
export const PrivateKeyACD = 'cPtZVYmMDT4aLm9inqXG9N8HQhAD5GgM8LuXZUbbFcqZTTcvQSP9'
