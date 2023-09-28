'use strict'
import dataRoutes from "../src/routes/data.js" 
import {expect } from "chai"
import fastify from "fastify" 

describe('data routes', () => {
  it('shoud create a new user for db', async () => {

    const response = await fastify.inject({
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

    const response = await fastify.inject({
      method: 'post',
      url: '/login'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
it('shoud create a new user for db', async () => {

    const response = await fastify.inject({
      method: 'delete',
      url: '/delete'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
})
 


 