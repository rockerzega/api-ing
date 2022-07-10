import fs from 'fs'
import path from 'path'
import { Router } from 'restify-router'
//import notificaciones from './notificaciones'
import usuarios from './usuarios'
import axios from 'axios'
// import { API_UPCONTA } from "@/config"
import { instanceAxios } from '@/src/libs/utils'

const router = new Router()


router.post('/', (req, res) => { 
  console.log(req.body)
  res.send('enviado exitosamente')
})

router.get('/', async (req, res, next) => {
  try {
    // const { data } = await axios.get(API_UPCONTA+'/v3/continuidad/programas',{
    //   headers: { Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiNjE4MmI4MjU3NDg5YjZhZDAzYjY2NTQ2IiwiYnVzaW5lc3MiOiI1YTJhYzQ5Y2JiYmNlMjEyZjg4NTUyOWMiLCJ0eXBlIjowLCJkYXRlIjoxNjU3Mjk1ODI1OTUwLCJlbmREYXRlIjoxNjU3ODYxMTk5OTk5fQ.UnTxQh4jhXZPITFmmD4FYasVzyz8eu0aXd28e4dDLUg'}
    // })
    // res.json(data)
    // const data = await instanceAxios('get', API_UPCONTA+'/v3/continuidad/programas')
    // res.json(data)
  } catch (err) {}
  })

router.add('/usuarios', usuarios)

export default router
