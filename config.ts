export const DEVELOPMENT_ENV =
  process.env.UPCONTAENV !== 'production' || !!__DEV__
export const API_UPCONTA =
  process.env.API_UPCONTA || 'http://localhost:3001'

  function getDatabaseURI () {
    const mongo = {
      user: process.env.MONGO_USERNAME || 'ingsoftware',
      pass: process.env.MONGO_PASSWORD || 'jvTz5KZQiJQ2Y5q',
      host: process.env.MONGO_HOST || '34.135.75.208',
      port: process.env.MONGO_PORT || 48613,
      db: 'notificacionestoc'
    }
    return process.env.USE_LOCAL_DB
      ? `mongodb://127.0.0.1:27017/ingsoftwaredev`
      : `mongodb+srv://${mongo.user}:${mongo.pass}@ingsoft.j1xev.mongodb.net/?retryWrites=true&w=majority`
  }
  
  export default {
    name: 'api-notificaciones',
    version: '0.0.1',
    port: process.env.PORT || '3001',
    databaseURI: getDatabaseURI(),
    databaseAttempts: 20,
    advisorSecret: 'SsSadvisorSecret',
  }
  export const usuarioSecret = 'tHeN0t1c4tIonS3rVic3'

  // mongodb+srv://ingsoftware:<password>@ingsoft.j1xev.mongodb.net/?retryWrites=true&w=majority