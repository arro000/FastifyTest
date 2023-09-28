'use strict'
import {expect } from "chai" 
import server from "../src/server.js"

describe('data routes', () => {
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
      method: 'GET',
      url: '/data/'+1
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})

it('shoud create a new user for db', async () => {

    const response = await server.inject({
      method: 'PATCH',
      url: '/data/'+1
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
it('shoud create a new user for db', async () => {
    const response = await server.inject({
        method: 'DELETE',
        url: '/data/'+1
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
})
})

 


 
 