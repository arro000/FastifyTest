'use strict'



import dataRoutes from "../routes/data.js" 
import {describe,expect } from "chai"
import fastify from "fastify" 

describe('data routes', () => {
  it('shoud create a new user for db', async () => {

    const response = await app.inject({
      method: 'post',
      url: '/register'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})

it('shoud create a new user for db', async () => {

    const response = await app.inject({
      method: 'post',
      url: '/login'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
it('shoud create a new user for db', async () => {

    const response = await app.inject({
      method: 'delete',
      url: '/delete'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
})
 


 