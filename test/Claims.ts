import { ClaimType, Work } from '../src/Interfaces'

export const TheRaven: Work = {
  id: 'be81cc75bcf6ca0f1fdd356f460e6ec920ba36ec78bd9e70c4d04a19f8943103',
  publicKey: '02badf4650ba545608242c2d303d587cf4f778ae3cf2b3ef99fbda37555a400fd2',
  signature: '30450221009f8e0648bbc6b6abf68044a6d1379f2a9dc937940044e20794d37be0299ede8d0220353f2772dd92f00807711fc525dfff6fbbf3d8ce069b0f2b6e7c437cb5649879',
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

export const PrivateKey = 'KxuZJmgVAipi9hfYXHTyGYmmhkbG7fBzmkyVnj6t9j9rDR1nN1vN'
