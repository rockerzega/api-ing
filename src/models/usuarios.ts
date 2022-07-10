import { Model, SchemaTypes, Types, Document, SchemaDefinition } from 'mongoose'

export interface Usuario extends Document {
  usuario: string
  contrasenia: string
  nombre: string
  apellido: string
  direccion: string
  ciudad: string
}

const Usuario: SchemaDefinition<Usuario> = {
  usuario: { type: String, required: true },
  contrasenia: { type: String, required: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  direccion: { type: String, required: false, default: null },
  ciudad: { type: String, required: false, default: null }
}

export type UsuarioDocument = Usuario & Document

export type UsuarioModel = Model<UsuarioDocument>

export default Usuario
