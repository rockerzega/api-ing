import Debug from 'debug'
import dayjs from 'dayjs'
import { BadRequestError } from 'restify-errors'
import { model, Schema, Types, SchemaTypes } from 'mongoose'

const debug = Debug('api:src:models:utils')

export interface UserConfig extends Types.Subdocument {
  /**
   * El tipo de configuración. Este campo no se deberia repetir nunca.
   */
  tipo: string

  /**
   * La configuración se guarda en formato string, y debe ser transformada en el
   * app.
   */
  valor: string

  /**
   * En el caso de que sea una configuración de administrador se debe guardar a
   * la empresa a la que pertenece esta configuración.
   */
  business?: Types.ObjectId
}

// export const UserConfig = new Schema<UserConfig>({
//   tipo: { type: String, required: true },
//   valor: { type: String, required: true },
//   business: SchemaTypes.ObjectId,
// })

// export interface Movement extends Types.Subdocument {
//   type: string
//   date?: Date
//   user?: Types.ObjectId
//   info?: unknown
// }

// export const Movement = new Schema<Movement>(
//   {
//     type: { type: String, required: true },
//     date: { type: SchemaTypes.Date, default: () => new Date() },
//     user: Types.ObjectId,
//     info: Object,
//   },
//   { _id: false },
// )

// export interface infoAdicionalSchema extends Types.Subdocument {
//   nombre: string
//   valor: string
// }

// export const infoAdicionalSchema = new Schema(
//   {
//     nombre: { type: String, required: true },
//     valor: { type: String, maxlength: 300, trim: true, required: true },
//   },
//   { _id: false },
// )

// export interface BankAccount extends Types.Subdocument {
//   tipoCuenta: 'extranjera' | 'nacional'
//   nombreCuenta?: string
//   rfcBanco?: string
//   cuentaBancaria: string
//   nombreBancoExt?: string
// }

// export const BankAccount = new Schema<BankAccount>({
//   tipoCuenta: {
//     type: String,
//     required: true,
//     enum: ['extranjera', 'nacional'],
//   },
//   nombreCuenta: String,
//   rfcBanco: String,
//   cuentaBancaria: { type: String, require: true },
//   nombreBancoExt: String,
// })

// export interface Attachment extends Types.Subdocument {
//   _id: Types.ObjectId
//   name: string
//   mimetype: string
//   fromFileLibrary?: boolean
// }

// export const Attachment = new Schema<Attachment>({
//   _id: { type: SchemaTypes.ObjectId, required: true },
//   name: { type: String, required: true },
//   mimetype: { type: String, required: true },
//   fromFileLibrary: Boolean,
// })

export function uniqueDocValidator(
  fields: string | string[],
  message?: string,
) {
  const paths = typeof fields === 'string' ? [fields] : fields
  return {
    async validator() {
      const query: Record<string, unknown> = { _id: { $ne: this._id } }
      paths.forEach((field) => {
        const value = this.get(field, undefined, { getters: false })
        if (value === undefined) return
        query[field] = value
      })
      return (await this.constructor.countDocuments(query)) === 0
    },
    message: ({ value }) =>
      message || `Ya existe un documento con identificador: ${value}.`,
  }
}

/**
 * Elimina el campo si es vacio. Esto deberia aplicarse solo para los campos
 * opcionales.
 */
export function removeEmpty(val: string | number) {
  if (val === null) {
    return undefined
  }
  const tipoDato = typeof val
  if (tipoDato === 'number') {
    return val
  } else {
    return !val || (<string>val).length === 0 ? undefined : val
  }
}

/**
 * Verifica si el recurso no ha sido utilizado en alguna colección de la base de
 * datos.
 * @param collections Un objeto con las colecciones en donde se debe realizar la
 * búsqueda y su nombre en español.
 * @param match El match que será aplicado al `findOne`
 */
export async function preRemove(
  collections: Record<string, string>,
  match: Record<string, unknown>,
) {
  for (const key in collections) {
    const exists = await model(key).findOne(match, '_id')
    debug('pre remove para %s con query: %o', key, match)
    if (exists) {
      throw new BadRequestError(`El documento está siendo ocupado en: \
${collections[key]}`)
    }
  }
}

export const emailValidator = {
  validator: (v: string) => v.includes('@'),
  message: (props: { path: string; value: string }) =>
    `${props.value} no es un correo electrónico válido`,
}

export const sriDateFormat = {
  validator: (v: string) => dayjs(v, 'DD/MM/YYYY').isValid(),
  message: (p: { value: string }) =>
    `${p.value} no es una fecha valida. Ingrésela en formato dd/mm/yyyy`,
}

export const numDocFormat = {
  validator: (v: string) => /[0-9]{3}-[0-9]{3}-[0-9]{9}/.test(v),
  message: (p: { value: string }) =>
    `${p.value} no es un número de documento válido`,
}
