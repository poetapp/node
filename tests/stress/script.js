import http from 'k6/http'
import { check, sleep } from 'k6'

export default function() {

  const requestClaim = http.get('http://localhost:3000')

  const url = 'http://localhost:18080/works'
  var payload = requestClaim.body
  var params =  { headers: { 'Content-Type': 'application/json' } }
  const res = http.post(url, payload, params)

  check(res, {
    "is status 202": (r) => r.status === 202
  });

  sleep(1)
}
