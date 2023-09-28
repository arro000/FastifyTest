'use strict'
import dataRoutes from "../src/routes/data.js" 
import {expect } from "chai"

import serverBuilder from "../src/server.js"
const server= serverBuilder(true)

describe('user routes', () => {
  it('shoud create a new user for db', async () => {

    const response = await server.inject({
      method: 'POST',
      url: '/register',
      body:{
        username:"gino",
        password :"pino"
      }
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})

it('shoud create a new user for db', async () => {

    const response = await server.inject({
      method: 'post',
      url: '/login'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
it('shoud create a new user for db', async () => {

    const response = await server.inject({
      method: 'delete',
      url: '/delete'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
})
 


 