import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'

import { WorkController } from './WorkController'

export class API {
  private readonly configuration: Configuration
  private readonly koa = new Koa()
  private readonly koaRouter = new KoaRouter()
  private readonly workController = new WorkController()

  constructor(configuration: Configuration) {
    this.configuration = configuration

    this.koaRouter.get('/works/:id', this.getWork)
    this.koaRouter.post('/works', this.postWork)

    this.koa.use(this.koaRouter.routes())
    this.koa.use(this.koaRouter.allowedMethods())
  }

  start() {
    console.log('API Loaded Configuration', this.configuration)
    this.koa.listen(this.configuration.port, '0.0.0.0')
  }

  private getWork = (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    const id = context.request.get('id')
    const work = this.workController.getById(id)
    context.body = work
  }

  private postWork = (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {

  }
}

export interface Configuration {
  readonly port: number
}
