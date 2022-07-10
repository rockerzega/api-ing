import Debug from 'debug'
import { model, Schema } from 'mongoose'
import mongooseSmartQuery from 'mongoose-smart-query'
import { msqTemporalOptions } from '@/src/libs/utils'
import Usuario, {
  UsuarioDocument, UsuarioModel,
} from '@/src/models/usuarios'

const debug = Debug('api:src:services:usuarios')

const schema = new Schema<UsuarioDocument, UsuarioModel>(Usuario, {
  timestamps: true,
})

schema.plugin(mongooseSmartQuery, {
  fieldsForDefaultQuery: 'usuario contrasenia',
  ...msqTemporalOptions,
})

export default model('usuarios', schema)