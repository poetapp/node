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
import * as Joi from 'joi'
import Koa from 'koa'
import KoaBody from 'koa-body'
import KoaCors from 'koa-cors'
import helmet from 'koa-helmet'
import KoaRouter from 'koa-router'
import * as Pino from 'pino'
import { map, values, prop, pipe } from 'ramda'

import { childWithFileName } from 'Helpers/Logging'

import { FileController } from './FileController'
import { GraphController } from './GraphController'
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

export interface Dependencies {
  readonly logger: Pino.Logger
  readonly fileController: FileController
  readonly workController: WorkController
  readonly graphController: GraphController
  readonly healthController: HealthController
  readonly verifiableClaimSigner: VerifiableClaimSigner
}

export interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: RouterConfiguration
}

export interface Router {
  readonly start: () => Promise<void>
  readonly stop: () => Promise<void>
}

export const Router = ({
  dependencies: {
    logger,
    fileController,
    workController,
    graphController,
    healthController,
    verifiableClaimSigner,
  },
  configuration,
}: Arguments): Router => {
  let server: http.Server
  const routerLogger = childWithFileName(logger, __filename)
  const koaRouter = new KoaRouter()
  const koa = new Koa()

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

  const start = async () => {
    server = koa.listen(configuration.port, '0.0.0.0')
  }

  const stop = async () => {
    routerLogger.info('Stopping API Router...')
    await server.close()
  }

  const postFile = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    routerLogger.debug('POST /files')

    const files = context.request.files || {}

    if (values(files).length <= 0)
      throw new IllegalArgumentException('No file found.')

    const responses = await fileController.addFiles(map(createStreamFromFile, values(files)))

    context.body = responses
    context.status = 200
  }

  const getWork = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    routerLogger.debug({ params: context.params }, 'GET /works/:id')

    const id = context.params.id
    const work = await workController.getById(id)

    if (!work) throw new NotFoundException('')

    context.body = work
  }

  const getHealth = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    context.body = await healthController.getHealth()
  }

  const getWorks = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    routerLogger.debug({ query: context.query }, 'GET /works')

    const { works, count } = await workController.getByFilters({
      ...context.query,
      offset: parseInt(context.query.offset, 10),
      limit: parseInt(context.query.limit, 10),
    })
    context.set('X-Total-Count', `${count}`)
    context.body = works
  }

  const getWorkCounts = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    routerLogger.debug('GET /metrics')

    const TotalWorkClaims = await workController.getWorksCountByFilters({
      ...context.query,
    })
    context.body = { TotalWorkClaims }
  }

  const postWork = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    const { body } = context.request

    routerLogger.debug({ body }, 'POST /works')

    if (!isSignedVerifiableClaim(body))
      throw new IllegalArgumentException('Request Body must be a Signed Verifiable Claim.')

    if (!isWork(body))
      throw new IllegalArgumentException(
        `Signed Verifiable Claim's type must be ${ClaimType.Work}, not ${Object(body).type}`,
      )

    if (!(await verifiableClaimSigner.isValidSignedVerifiableClaim(body)))
      throw new IllegalArgumentException('Signed Verifiable Claim\'s signature is incorrect.')

    await workController.create(body)

    context.body = ''
    context.status = 202
  }

  const getGraph = async (context: KoaRouter.IRouterContext, next: () => Promise<any>) => {
    const { uri } = context.params
    routerLogger.debug({ uri }, 'GET /graph')
    const graph = await graphController.getByUri(uri)
    context.body = graph
  }

  koaRouter.post(
    '/files',
    KoaBody({ multipart: true, formidable: { multiples: false, maxFields: 1 } }),
    postFile,
  )
  koaRouter.get('/works/:id', RequestValidationMiddleware(getWorkSchema), getWork)
  koaRouter.get('/works', RequestValidationMiddleware(getWorksSchema), getWorks)
  koaRouter.post('/works', KoaBody({ textLimit: 1000000 }), postWork)
  koaRouter.get('/graph/:uri', getGraph)
  koaRouter.get('/health', getHealth)
  koaRouter.get('/metrics', getWorkCounts)

  koa.use(helmet(SecurityHeaders))
  koa.use(KoaCors({ expose: ['X-Total-Count'] }))
  koa.use(LoggerMiddleware(logger))
  koa.use(HttpExceptionsMiddleware)
  koa.use(koaRouter.allowedMethods())
  koa.use(koaRouter.routes())

  return {
    start,
    stop,
  }
}
