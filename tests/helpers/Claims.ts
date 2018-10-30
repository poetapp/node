/* tslint:disable:max-line-length */
import { ClaimType, SignedVerifiableClaim } from '@po.et/poet-js'

export const AStudyInScarlet: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: 'f4b3e6cd7e516211d1b718b84860d26f59e3933c03c25c29d4e9ce9cc34ff26b',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IkdhRWZ2QURLQUw1ZXVWQjZxZ2p1djlnMkxoOVBhM2FuWkxLZjRnUlFvWVM0In0=',
  issuanceDate: '2018-10-12T01:54:11.559Z',
  claim: {
    name: 'A Study in Scarlet',
    author: 'Arthur Conan Doyle',
    tags: 'detective novel, detective',
    dateCreated: '1886-01-01T00:00:00.000Z',
    datePublished: '1887-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IkdhRWZ2QURLQUw1ZXVWQjZxZ2p1djlnMkxoOVBhM2FuWkxLZjRnUlFvWVM0In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19.._qJsUa-caH8BLds4rVLV9GuMEqxUlw6VRyfXN23Z0KHgtnJIiTnXoSzuwFF_rnIicza94Ggh5xkGAT4hZcrwBQ',
      'sec:nonce': 'cjn5czg1u0000mnc93s13ihuz',
    },
  },
}

export const TheMurdersInTheRueMorgue: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: 'bef82fd1df606421cbdf24993d5fabdcd5b83b70a44e8af9ecc64ec4a2fe098c',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjQyVk1GYWVONVhTZk5qQk4zUEU3ckZvU1lycHBmUDR2aWZSMVlXZnB6eDhYIn0=',
  issuanceDate: '2018-10-12T01:54:11.637Z',
  claim: {
    name: 'The Murders in the Rue Morgue',
    author: 'Edgar Allan Poe',
    tags: 'short story, detective story, detective',
    dateCreated: '1841-01-01T00:00:00.000Z',
    datePublished: '1841-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjQyVk1GYWVONVhTZk5qQk4zUEU3ckZvU1lycHBmUDR2aWZSMVlXZnB6eDhYIn0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..kv3FTelr03-3STNzLxiwseYIUpat02iq-Qvn3mpThl7NNgAHaNmOHqXNNy8UuEMm4gUmvVfDXQLE0GOIzxGZDg',
      'sec:nonce': 'cjn5czg3i0001mnc9e62ntdzj',
    },
  },
}

export const TheRaven: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: 'eb1de236c5ed14930e0a0bac87bdc3e26778670a5a6dc35d6acce931290017c7',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjQyVk1GYWVONVhTZk5qQk4zUEU3ckZvU1lycHBmUDR2aWZSMVlXZnB6eDhYIn0=',
  issuanceDate: '2018-10-12T01:54:11.673Z',
  claim: {
    name: 'The Raven',
    author: 'Edgar Allan Poe',
    tags: 'poem',
    dateCreated: '',
    datePublished: '1845-01-29T03:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjQyVk1GYWVONVhTZk5qQk4zUEU3ckZvU1lycHBmUDR2aWZSMVlXZnB6eDhYIn0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3_84-KBC4XPVhakWX9SC1fRrTyo4laIoyvef17KK305-vhgpGRfrAZP9d0FGomf4pPOpkRP_Zzo13sQ-yvG-CQ',
      'sec:nonce': 'cjn5czg4d0002mnc90aru2bn1',
    },
  },
}

export const TheWeekOfDiana: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '83eb777ce7dc56d949940ecc751ca3dc7cd5c0dee33bdb5ad53be2892e021971',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.699Z',
  claim: {
    name: 'The Week of Diana',
    author: 'Maya Angelou',
    tags: 'poem',
    dateCreated: '1997-09-06T00:00:00.000Z',
    datePublished: '1997-09-06T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..UbXYJ5F0oBg2L0l_AodJEhJZOaGfbfL3cJvYhz9kDEii7LvEd-5UIlVqRYVWrcG0Rk27n0GHbAV0CwAdSRgsAQ',
      'sec:nonce': 'cjn5czg540003mnc9esa6dobt',
    },
  },
}

export const KnowWhyTheCagedBirdSings: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '9d07329481a645edcfb0ce96681c21888c98fb945194aa3d724835af32f4f4c7',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.716Z',
  claim: {
    name: 'Know Why the Caged Bird Sings',
    author: 'Maya Angelou',
    tags: 'autobiography',
    dateCreated: '1969-01-01T00:00:00.000Z',
    datePublished: '1969-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..NAS6_tYzYQdBk7nnbW-yZghoTNgZEWgmekjRxPNTMKhmnjS7TVCHv-MhYmzqEkuGpGAgmlmoxFtTYbm2_DvJBw',
      'sec:nonce': 'cjn5czg5k0004mnc91gh6av18',
    },
  },
}

export const GatherTogetherInMyName: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '1d5da7af4370ee6b079b60b27782913fb3eaa526e4bf9a82568e1f39ae48f043',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.739Z',
  claim: {
    name: 'Gather Together in My Name',
    author: 'Maya Angelou',
    tags: 'autobiography',
    dateCreated: '1974-01-01T00:00:00.000Z',
    datePublished: '1974-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..6VV67J_vcwm5wady0nkcTo1HUPeKJaljvsaCDapinVaJMETmLYJGJUI6t4Og30sINLuDo1ai22PpBnPGqXb_BA',
      'sec:nonce': 'cjn5czg680005mnc96iqai24s',
    },
  },
}

export const SinginAndSwinginAndGettingMerryLikeChristmas: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '7453b6020e55e6ecf817837c5831db6d507a15498c113def3c6e922118395f1b',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.756Z',
  claim: {
    name: 'Singin\' and Swingin\' and Gettin\' Merry Like Christmas',
    author: 'Maya Angelou',
    tags: 'autobiography',
    dateCreated: '1976-01-01T00:00:00.000Z',
    datePublished: '1976-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EbJfqEAEQ7neSIxgZs2Rp64i8fOHOje5rvhUYGNcmJAYktKp4J_Pr_iM52ythAyXKS1z-LCJc9scDeSaltxHAQ',
      'sec:nonce': 'cjn5czg6o0006mnc983h5nr0h',
    },
  },
}

export const TheHeartOfAWoman: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '42fb449d583831178963fe5f04ebb75263f84063a892a3e98cdb7b3c3c385596',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.773Z',
  claim: {
    name: 'The Heart of a Woman',
    author: 'Maya Angelou',
    tags: 'autobiography',
    dateCreated: '1981-01-01T00:00:00.000Z',
    datePublished: '1981-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..hK6C5ag3YamK295rragVMhDl2kAlm8aqvsxnNUFqxLhRVjxkMDiT-r7HIdSGzczFMQLCQ-iiPxynBZgtjiqNDQ',
      'sec:nonce': 'cjn5czg790007mnc9n39wkajj',
    },
  },
}

export const AllGodsChildrenNeedTravelingShoes: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: 'eda7d7a3a2c093b86d62c763b798d8615094be7f31eb3e691dc96b9c6621f6ac',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.799Z',
  claim: {
    name: 'All God\'s Children Need Traveling Shoes',
    author: 'Maya Angelou',
    dateCreated: '1986-01-01T00:00:00.000Z',
    tags: 'autobiography',
    datePublished: '1986-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..8aXsC6ecLbPo3WspdT9-h98DoHEKJLdW15dqrTFXInJobbQiIKmWfzmjhQAMWn0x6ykqRL7HtAo7HHBqkkm7CQ',
      'sec:nonce': 'cjn5czg7u0008mnc9w6q40sn9',
    },
  },
}

export const ASongFlungUpToHeaven: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '129215bab01ec528f24f4e391cc57cb6d7b1a1d2bdee278bacbe59228e57ffd4',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.815Z',
  claim: {
    name: 'A Song Flung Up to Heaven',
    author: 'Maya Angelou',
    tags: 'autobiography',
    dateCreated: '2002-01-01T00:00:00.000Z',
    datePublished: '2002-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..bX5W0KjQuc_NvJFDoxvE2YuheFMYAOi6v6jc5rRxtulLaaLh3F8SLapwJS2w_HfJYEb2BLtxhRdcHppOyAVoBQ',
      'sec:nonce': 'cjn5czg8b0009mnc9584kx4z6',
    },
  },
}

export const MomAndMeAndMom: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: 'b9a5398933eaac26784965402aff0f5d8dfbfc0b2cb03d1f2fb26870b1f19578',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.836Z',
  claim: {
    name: 'Mom & Me & Mom',
    author: 'Maya Angelou',
    tags: 'autobiography',
    dateCreated: '2013-01-01T00:00:00.000Z',
    datePublished: '2013-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..8CEd2kKYSSVPl2peYIgtUWhp5vGWqlYn67tDwpmvkcNSBkbYI4sQ5Mir5ktCPFFH5IotwCwV0lKx9tG8Jiw6Dg',
      'sec:nonce': 'cjn5czg8w000amnc928f58bl2',
    },
  },
}

export const OnThePulseOfMorning: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: '8030edb527be097392e7db4fb4a61f5526a2877cfe8296a527f6c6ee2c751177',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.852Z',
  claim: {
    name: 'On the Pulse of Morning',
    author: 'Maya Angelou',
    tags: 'poem',
    dateCreated: '1993-01-01T00:00:00.000Z',
    datePublished: '1993-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EMCdGhMQ4KOg-fFttw8umB0hAyzH9RpDJ-6Zq-TViu3Q5m_UtlO2tbYE_pKzcqRYcdzNPca5kuRkthPOJarTBA',
      'sec:nonce': 'cjn5czg9b000bmnc9lniyjsqu',
    },
  },
}

export const ABraveAndStartlingTruth: SignedVerifiableClaim = {
  '@context': {
    cred: 'https://w3id.org/credentials#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    sec: 'https://w3id.org/security#',
    id: 'sec:digestValue',
    issuer: 'cred:issuer',
    issuanceDate: 'cred:issued',
    type: 'schema:additionalType',
    claim: 'schema:CreativeWork',
    archiveUrl: 'schema:url',
    author: 'schema:author',
    canonicalUrl: 'schema:url',
    contributors: {
      '@id': 'schema:ItemList',
      '@container': '@list',
      '@type': 'schema:contributor',
    },
    copyrightHolder: 'schema:copyrightHolder',
    dateCreated: 'schema:dateCreated',
    datePublished: 'schema:datePublished',
    license: 'schema:license',
    name: 'schema:name',
    tags: 'schema:keywords',
    hash: 'sec:digestValue',
  },
  id: 'e69befb7aaf8ca87de36025e93dd88cf93aeed522d030b92b255553bec96a652',
  type: ClaimType.Work,
  issuer:
    'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
  issuanceDate: '2018-10-12T01:54:11.876Z',
  claim: {
    name: 'A Brave and Startling Truth',
    author: 'Maya Angelou',
    tags: 'poem',
    dateCreated: '1995-01-01T00:00:00.000Z',
    datePublished: '1995-01-01T00:00:00.000Z',
  },
  'sec:proof': {
    '@graph': {
      '@type': 'sec:Ed25519Signature2018',
      'dc:created': {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': '2018-10-12T01:54:11Z',
      },
      'dc:creator': {
        '@id':
          'data:;base64,eyJhbGdvcml0aG0iOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCIsInB1YmxpY0tleSI6IjhRaU5GblJlN3BkcnhBOG5OM1hocUZGS3hieDY5b2JxR1RFYUZVQ0VKVWo2In0=',
      },
      'sec:jws':
        'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..dC-p1o8xc-jLHcK7z58KvhstCBSPWW-2rOL4P2_PDxFNwOdHVuWNnSCj5IZwUrFDwsafd9a-BQCUlF1jZHJJDg',
      'sec:nonce': 'cjn5czga0000cmnc9hug2zggn',
    },
  },
}
