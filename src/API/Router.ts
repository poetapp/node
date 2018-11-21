import {
  ClaimType,
  isWork,
  IllegalArgumentException,
  NotFoundException,
  isSignedVerifiableClaim,
  VerifiableClaimSigner,
} from '@po.et/poet-js'
import * as fs from 'fs'
import * as http from 'http'
import { injectable, inject } from 'inversify'
import * as Joi from 'joi'
import * as Koa from 'koa'
import * as KoaBody from 'koa-body'
import * as KoaCors from 'koa-cors'
import * as helmet from 'koa-helmet'
import * as KoaRouter from 'koa-router'
import * as Pino from 'pino'
import { map, values, prop, pipe } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'

import { FileController } from './FileController'
import { HealthController } from './HealthController'
import { HttpExceptionsMiddleware } from './Middlewares/HttpExceptionsMiddleware'
import { LoggerMiddleware } from './Middlewares/LoggerMiddleware'
import { RequestValidationMiddleware } from './Middlewares/RequestValidationMiddleware'
import { SecurityHeaders } from './SecurityHeaders'
import { WorkController } from './WorkController'

export interface RouterConfiguration {
  readonly port: number
}

const getPath = prop('path')

const createStreamFromFile = pipe(getPath, fs.createReadStream)

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly configuration: RouterConfiguration
  private readonly koa = new Koa()
  private readonly koaRouter = new KoaRouter()
  private readonly fileController: FileController
  private readonly workController: WorkController
  private readonly healthController: HealthController
  private server: http.Server
  private readonly verifiableClaimSigner: VerifiableClaimSigner

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('RouterConfiguration') configuration: RouterConfiguration,
    @inject('FileController') fileController: FileController,
    @inject('WorkController') workController: WorkController,
    @inject('HealthController') healthController: HealthController,
    @inject('VerifiableClaimSigner') verifiableClaimSigner: VerifiableClaimSigner,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.configuration = configuration
    this.fileController = fileController
    this.workController = workController
    this.healthController = healthController
    this.verifiableClaimSigner = verifiableClaimSigner

    const getWorkSchema = {
      params: {
        id: Joi.string().required(),
      },
    }

    const getWorksSchema = {
      query: {
        issuer: Joi.string().optional(),
        offset: Joi.number().optional(),
        limit: Joi.number().optional(),
      },
    }

    this.koaRouter.post(
      '/files',
      KoaBody({ multipart: true, formidable: { multiples: false, maxFields: 1 } }),
      this.postFile,
    )
    this.koaRouter.get('/works/:id', RequestValidationMiddleware(getWorkSchema), this.getWork)
    this.koaRouter.get('/works', RequestValidationMiddleware(getWorksSchema), this.getWorks)
    this.koaRouter.post('/works', KoaBody({ textLimit: 1000000 }), this.postWork)
    this.koaRouter.get('/health', this.getHealth)
    this.koaRouter.get('/metrics', this.getWorkCounts)

    this.koa.use(helmet(SecurityHeaders))
    this.koa.use(KoaCors({ expose: ['X-Total-Count'] }))
    this.koa.use(LoggerMiddleware(this.logger))
    this.koa.use(HttpExceptionsMiddleware)
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

  private postFile = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {

    const files = context.request.files || {}

    if (values(files).length <= 0)
      context.throw(400, 'No file found.')

    const responses = await this.fileController.addFiles(map(createStreamFromFile, values(files)))

    context.body = responses
    context.status = 200
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

  private getWorkCounts = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    this.logger.trace('/metrics')
    const TotalWorkClaims = await this.workController.getWorksCountByFilters({
      ...context.query,
    })
    context.body = { TotalWorkClaims }
  }

  private postWork = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    const { body } = context.request

    this.logger.trace({ body }, 'POST /works')

    if (!isSignedVerifiableClaim(body))
      throw new IllegalArgumentException('Request Body must be a Signed Verifiable Claim.')

    if (!isWork(body))
      throw new IllegalArgumentException(
        `Signed Verifiable Claim's type must be ${ClaimType.Work}, not ${Object(body).type}`,
      )

    if (!(await this.verifiableClaimSigner.isValidSignedVerifiableClaim(body)))
      throw new IllegalArgumentException('Signed Verifiable Claim\'s signature is incorrect.')

    await this.workController.create(body)

    context.body = ''
    context.status = 202
  }
}
