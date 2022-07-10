import Debug from 'debug'
import morgan from 'morgan'
import routes from './src/routes'
import restify from 'restify'
import config from './config'
import mongoose from 'mongoose'
//import SocketConnection from './src/sockets'
import errs from 'restify-errors'
//import corsMiddleware from 'restify-cors-middleware2'

const debug = Debug('api:index')

// const cors = corsMiddleware({
//   preflightMaxAge: 5,
//   origins: ['*'],
//   allowHeaders: ['Authorization', 'Role'],
//   exposeHeaders: ['Authorization', 'Role'],
// })

declare module 'restify' {
  interface Request {
    payload?: any;
  }
}
const server = restify.createServer({
  name: config.name,
  version: config.version,
})
//export const serverSocket = new SocketConnection(server.server)
server.server.setTimeout(60000 * 5)
if (__DEV__ === true) {
  server.use(morgan('dev'))
}

server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser({ mapParams: false }))

// server.pre(cors.preflight)
// server.use(cors.actual)

let counter = 0
const ATTEMPTS = 20
debug('conectando a la base de datos:\n%s', config.databaseURI)
mongoose.connect(config.databaseURI)
mongoose.connection.on('error', (err) => {
  debug('error conectando a la base de datos')
  if (err.code === 'ECONNREFUSED' && counter !== ATTEMPTS) {
    console.log(`intentando conectar a mongodb [${++counter}/${ATTEMPTS}]...`)
    setTimeout(() => {
      mongoose.connect(config.databaseURI)
    }, 5000)
  } else {
    console.error(err)
    process.exit(1)
  }
})

mongoose.connection.once('open', () => {
  debug('se conectó a la base de datos')
  routes.applyRoutes(server)
  server.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`)
  })
})

server.on('restifyError', (req, res, err, callback) => {
  try {
    err.toJSON = function () {
      return {
        code: err.name,
        message: err.message,
        ...(errs as any).info(err),
      }
    }
  } catch {}
  // if (err.name === 'RequestExpiredError') { return callback() }
  // if (['GET', 'HEAD', 'POST'].includes(req.method) &&
  //   req.href().includes('/auth')) { return callback() }
  if (
    req.href().includes('/auth')
  ) {
    return callback()
  }
  let errorMessage: any
  switch (err.name) {
    case 'ValidationError':
      errorMessage = err.toString()
      break
    default:
      errorMessage = err
  }
  console.error(
    '*** Fecha:',
    new Date().toLocaleString(),
    '\nEmpresa:',
    req.payload?.business,
    '\nEndpoint:',
    req.method,
    req.href(),
    '\nError:',
    errorMessage,
    '\nInformación adicional:',
    (<any>errs).info(err),
    '\n------------------------------------',
  )
  return callback()
})

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
}

const shutdown = (signal, value) => {
  console.log('shutdown!')
  server.close(() => {
    mongoose.connection.close(() => {
      console.log(`server stopped by ${signal} with value ${value}`)
      process.exit(128 + value)
    })
  })
}

Object.keys(signals).forEach((signal) => {
  process.on(<any>signal, () => {
    console.log(`process received a ${signal} signal`)
    shutdown(signal, signals[signal])
  })
})
