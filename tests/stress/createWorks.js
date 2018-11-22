import http from 'k6/http'
import { check, sleep } from 'k6'

const CLAIM_HOST = __ENV.CLAIM_HOST || 'http://0.0.0.0:3002' 
const NODE_HOST = __ENV.NODE_HOST || 'http://0.0.0.0:18080'
const DELAY_GET_WORK =  __ENV.DELAY_GET_WORK || 0

export default () => {

  const requestClaim = http.get(`${CLAIM_HOST}`)

  const url = `${NODE_HOST}/works`
  const payload = requestClaim.body
  const params =  { headers: { 'Content-Type': 'application/json' } }
  const work = http.post(url, payload, params)

  check(work, {
    'status 202': (r) => r.status === 202
  })

  sleep(1 + parseInt(DELAY_GET_WORK))

  const id = JSON.parse(work.request.body).id
  const urlGetWork = `${NODE_HOST}/works/${id}`
  const res = http.get(urlGetWork)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}
