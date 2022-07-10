import moment from 'moment'
// import Report from '@/libs/reports'
//import writtenNumber from 'written-number'
//import Business from '~/models/business'
import { capitalizeFirstLetters, getPDFBuffer } from '../models/utils'
import axios from 'axios'

const uptoken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiNjE4MmI4MjU3NDg5YjZhZDAzYjY2NTQ2IiwiYnVzaW5lc3MiOiI1YTJhYzQ5Y2JiYmNlMjEyZjg4NTUyOWMiLCJ0eXBlIjowLCJkYXRlIjoxNjU3Mjk1ODI1OTUwLCJlbmREYXRlIjoxNjU3ODYxMTk5OTk5fQ.UnTxQh4jhXZPITFmmD4FYasVzyz8eu0aXd28e4dDLUg'

export function zeroFill(number, width) {
  width -= number.toString().length
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number
  }
  return number + ''
}

export function nDecimals(number, decimals) {
  if (typeof decimals !== 'number') {
    decimals = 2
  }
  const mult = 10 ** decimals
  return Math.round(number * mult) / mult
}

export function nFloat(number, decimals = 2) {
  const mult = 10 ** decimals
  return Math.round(number * mult) / mult
}


export async function instanceAxios (method, kid, body = undefined) {
  debug('generando peticion interna')
  return axios({
    url: kid,
    method: method,
    baseURL: kid,
    data: body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': uptoken,
    },
  }).then(function (res) {
    return res.data
  })
}

// export async function verifyThereIsAccountingRules(business, ruleName) {
//   const rules = await Business.getRule(business, ruleName)
//   return rules && rules.rules && (rules.rules[0].debe || rules.rules[0].haber)
// }

// function toDateFormat(date) {
//   const newdate = moment(date.toISOString(), 'YYYY-MM-DD')
//   return newdate.format('YYYY/MM/DD')
// }

// function formatDateDDMMYYY(date) {
//   return moment(new Date(date)).format('DD/MM/YYYY')
// }

// function amountToLiteral(amount) {
//   const monto = String(amount).split('.')
//   const config = { lang: 'es' }
//   let entera = writtenNumber(Number(monto[0]), config) + ' '
//   if (monto[0] === '1') {
//     const value = COUNTRY === 'ec' ? 'dólar' : 'peso'
//     entera += value
//   } else {
//     const value = COUNTRY === 'ec' ? 'dólares' : 'pesos'
//     entera += value
//   }
//   entera = entera.replace('uno', 'un')
//   let decimal
//   if (monto.length === 2) {
//     decimal = writtenNumber(Number(monto[1]), config) + ' '
//     if (monto[1] === '1') {
//       decimal += 'centavo'
//     } else {
//       decimal += 'centavos'
//     }
//     decimal = decimal.replace('uno', 'un')
//   }
//   let montoLetra = capitalizeFirstLetters(entera)
//   if (decimal) {
//     montoLetra += ' con ' + capitalizeFirstLetters(decimal)
//   }
//   return montoLetra
// }

export function fillZeros(n, width) {
  n = n.toString()
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n
}

export function getHours(value) {
  const hours = Math.floor(value / 60)
  return fillZeros(hours, 2) + ':' + fillZeros(Math.floor(value % 60), 2)
}

export function to2D(num) {
  return Math.round(num * 100) / 100
}

// export { toDateFormat, formatDateDDMMYYY, amountToLiteral }

// cool

export function randomString(length = 10) {
  let result = ''
  const characters =
    'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export async function fileResponse(res, data, pdfEndpoint, filename) {
  const buffer = await getPDFBuffer(pdfEndpoint, JSON.stringify(data))
  res.header('Content-Disposition', `filename=${filename}`)
  res.header('Content-Length', buffer.length)
  res.header('Content-Type', 'application/pdf')
  res.write(buffer)
  res.end()
}

// export async function fileDispatcher({ res, data, type, path, filename }) {
//   const buffer =
//     type === 'pdf'
//       ? await getPDFBuffer(path, JSON.stringify(data))
//       : Report(data, path)
//   const mimetype =
//     type === 'pdf'
//       ? 'application/pdf'
//       : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//   res.header('Content-Disposition', `filename=${filename}`)
//   res.header('Content-Length', buffer.length)
//   res.header('Content-Type', mimetype)
//   res.write(buffer)
//   res.end()
// }
