const Koa = require('koa')
const { createACDClaim } = require('../helpers/createClaims')

const PORT = process.env.HOST || 3002

const main = async () => {
  const app = new Koa()

  app.use(async (ctx: any) => {
    const attributes = {
      name: `testing claim ${Date.now()}`,
      author: 'the tester',
    }

    ctx.body = await createACDClaim(attributes)
  })

  app.listen(PORT)
}

// tslint:disable:no-console
main().catch(console.error)
