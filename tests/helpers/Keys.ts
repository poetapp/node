/* tslint:disable:max-line-length */
import { createIssuerFromPrivateKey } from '@po.et/poet-js'

export const privateKeyACD = '2fac76SnmCGNE8DRYgiAdt2hB2J5GnKJ8wzPL6uu1AUVexnbuRnfRAsZU5ZNX46rASXWvvP5n8J153h2kbg66Uja'
export const privateKeyEAP = '2PU815H2Sgqhadmfj8F2sK7NF9HKdGtzQn97bS897iBhTPr1uK5N4U2W2CfsVrE6DpFU1E7QnmagE4yENZw1eqm9'
export const privateKeyMA = '2YjQfpYKRJXC37DxNmZ4NenmRCjKUrs6iBGuTRWWVNaMoEPTtbm61DYAqNoYQkHAVbRSyTjWxF6eR9Bw44U1o2qS'
export const privateKey = '3YB1tR3MkZBEJZEEwkAzrqJM76jaKcQR8FRA38M2G2Ta6kVuE6D9j9qcXr53gGVAxx9eJVMZeVcj5MbSNRjgvteB'

export const issuerACD = createIssuerFromPrivateKey(privateKeyACD)
export const issuerEAP = createIssuerFromPrivateKey(privateKeyEAP)
export const issuerMA = createIssuerFromPrivateKey(privateKeyMA)
export const issuer = createIssuerFromPrivateKey(privateKey)
