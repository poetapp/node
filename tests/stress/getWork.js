import http from 'k6/http'
import { check, sleep } from 'k6'

const NODE_HOST = __ENV.NODE_HOST || 'http://0.0.0.0:18080'

export const setup = () => {
  const url = `${NODE_HOST}/works`
  let res = http.get(url)

  return res.json()[0]
}


export default (data) => {
  const { id } = data
  const url = `${NODE_HOST}/works/${id}`
  const res = http.get(url)

  check(res, {
    'status 200': (r) => r.status === 200
  });

  sleep(1)
}
