import http from 'k6/http'
import { check, sleep } from 'k6'


const CLAIM_HOST = __ENV.CLAIM_HOST || 'http://localhost:3002' 
const NODE_HOST = __ENV.NODE_HOST || 'http://localhost:18080'

export default function() {

  const requestClaim = http.get(`${CLAIM_HOST}`)

  const url = `${NODE_HOST}/works`
  const payload = requestClaim.body
  const params =  { headers: { 'Content-Type': 'application/json' } }
  const res = http.post(url, payload, params)

  check(res, {
    'status 202': (r) => r.status === 202
  });

  sleep(1)
}
