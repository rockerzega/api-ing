import Debug from 'debug'
import dayjs from 'dayjs'
import jwt from 'jwt-simple'
import { Types } from 'mongoose'
import errs from 'restify-errors'
import { usuarioSecret } from '@/config'
import Usuario from '../services/Usuarios'
import { Request, Response, Next } from 'restify'

const debug = Debug('api:src:controllers:usuarios')

export const Middleware = middleware(usuarioSecret)

function middleware (secret:string) {
  return async (req: any, res:Response, next: Next) => {
    try {
      const authorization = getToken(req)
      req.payload = await getPayload(authorization, secret)
      next()
    } catch (err) {
      if (err.body.code === 'BadRequest') {
        next(err)
      } else {
        return next(new errs.UnauthorizedError({
          info: { typeCode: 'UnknownSession' },
        }, 'No se pudo reconocer la sesión'))
      }
    }
  }
}

function createToken (business: string, secret: string, expiration: string) {
  const date = dayjs().toISOString()
  const payload = { business, date, expiration }
  return jwt.encode(payload, secret)
}
async function getPayload (token: any, secret: string) {
  const payload = jwt.decode(token, secret)
  if (!payload) {
    throw new errs.BadRequestError({
      info: { typeCode: 'PayloadNotExist' },
    }, 'No se pudo decodificar el token')
  }
  const user = await Usuario.findOne({ business: payload.business })
  if (!user) {
    throw new errs.BadRequestError({
      info: { typeCode: 'UserNotExist' },
    }, 'El invitado no existe')
  }
  if (payload.expiration) {
    const expiration = dayjs(payload.expiration)
    const remaining = expiration.diff(new Date())
    if (remaining < 0) {
      throw new errs.UnauthorizedError({
        info: { typeCode: 'TokenExpired' },
      }, 'El token ha expirado')
    }
  }
  return payload
}

function getToken (req: Request) {
  const token = req.header('Authorization') || req.query.token
  if (!token) {
    throw new errs.BadRequestError({
      info: { typeCode: 'TokenNotFound' },
    }, 'No se proporcionó el token')
  }
  return token
}

async function auth (data: any) {
  const business = data.business
  const password = data.password
  const usuario = await Usuario.findOne({ business: new Types.ObjectId(business), password })
  if (!usuario) {
    throw new errs.UnauthorizedError({
      info: { typeCode: 'BadPassword' }
    }, 'La contraseña es incorrecta')
  }
  const dateExpiration = dayjs().add(2, 'year').toISOString()
  return { business, expiration: dateExpiration }
}

export default {
  async login  (req: Request, res: Response, next: Next) {
    debug('login')
      try {
        if (!req.body || !req.body.password) {
          throw new errs.BadRequestError({
            info: { typeCode: 'MissingFields' }
          }, 'Faltan campos en la petición')
        }
        const { business, expiration } = await auth(req.body)
        res.send(createToken(business, usuarioSecret, expiration))
      } catch (err) { next(err) }
    
  },
  async getAuth (req: Request, res: Response, next: Next) {
    try {
      const authorization = getToken(req)
      const respuesta = await getPayload(authorization, usuarioSecret)
      res.json({
        business: respuesta.business,
        creacion: respuesta.date,
        expiracion: respuesta.expiration
      })
    } catch (err) { next(err) }
  },
  async crearUsuario (req: Request, res: Response, next: Next) {
    try {
      const notificacion = await Usuario.create(req.body)
      res.json(notificacion)
    } catch (err) { next(err) }
  }
}
