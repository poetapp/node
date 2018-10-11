import {
  ClaimType,
  isWork,
  isValidSignature,
  IllegalArgumentException,
  NotFoundException,
  isClaim,
} from '@po.et/poet-js'
import * as http from 'http'
import { injectable, inject } from 'inversify'
import * as Joi from 'joi'
import * as Koa from 'koa'
import * as KoaBody from 'koa-body'
import * as KoaCors from 'koa-cors'
import * as helmet from 'koa-helmet'
import * as KoaRouter from 'koa-router'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'

import { HealthController } from './HealthController'
import { HttpExceptionsMiddleware } from './Middlewares/HttpExceptionsMiddleware'
import { LoggerMiddleware } from './Middlewares/LoggerMiddleware'
import { RequestValidationMiddleware } from './Middlewares/RequestValidationMiddleware'
import { RouterConfiguration } from './RouterConfiguration'
import { SecurityHeaders } from './SecurityHeaders'
import { WorkController } from './WorkController'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly configuration: RouterConfiguration
  private readonly koa = new Koa()
  private readonly koaRouter = new KoaRouter()
  private readonly workController: WorkController
  private readonly healthController: HealthController
  private server: http.Server

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('RouterConfiguration') configuration: RouterConfiguration,
    @inject('WorkController') workController: WorkController,
    @inject('HealthController') healthController: HealthController
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.configuration = configuration
    this.workController = workController
    this.healthController = healthController

    const getWorkSchema = {
      params: {
        id: Joi.string().required(),
      },
    }

    const getWorksSchema = {
      query: {
        publicKey: Joi.string().optional(),
        offset: Joi.number().optional(),
        limit: Joi.number().optional(),
      },
    }

    this.koaRouter.get('/works/:id', RequestValidationMiddleware(getWorkSchema), this.getWork)
    this.koaRouter.get('/works', RequestValidationMiddleware(getWorksSchema), this.getWorks)
    this.koaRouter.post('/works', this.postWork)
    this.koaRouter.get('/health', this.getHealth)

    this.koa.use(helmet(SecurityHeaders))
    this.koa.use(KoaCors({ expose: ['X-Total-Count'] }))
    this.koa.use(LoggerMiddleware(this.logger))
    this.koa.use(HttpExceptionsMiddleware)
    this.koa.use(KoaBody({ textLimit: 1000000 }))
    this.koa.use(this.koaRouter.allowedMethods())
    this.koa.use(this.koaRouter.routes())
  }

  async start() {
    this.server = this.koa.listen(this.configuration.port, '0.0.0.0')
  }

  async stop() {
    this.logger.info('Stopping API Router...')
    await this.server.close()
  }

  private getWork = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    this.logger.trace({ params: context.params }, 'GET /works/:id')

    const id = context.params.id
    const work = await this.workController.getById(id)

    if (!work) throw new NotFoundException('')

    context.body = work
  }

  private getHealth = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    context.body = await this.healthController.getHealth()
  }

  private getWorks = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    this.logger.trace({ query: context.query }, '/works')
    const { works, count } = await this.workController.getByFilters({
      ...context.query,
      offset: parseInt(context.query.offset, 10),
      limit: parseInt(context.query.limit, 10),
    })
    context.set('X-Total-Count', `${count}`)
    context.body = works
  }

  private postWork = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    const { body } = context.request

    this.logger.trace({ body }, 'POST /works')

    if (!isClaim(body)) throw new IllegalArgumentException('Request Body must be a Claim.')

    if (!isWork(body)) throw new IllegalArgumentException(`Claim's type must be ${ClaimType.Work}, not ${body.type}`)

    if (!isValidSignature(body)) throw new IllegalArgumentException("Claim's signature is incorrect.")

    await this.workController.create(body)

    context.body = ''
    context.status = 202
  }
}
