'use strict'
import {expect } from "chai"
import fs from "fs"
import serverBuilder from "../src/server.js"
import jwt from "jsonwebtoken"

const server= serverBuilder(true)
describe('user routes', () => {
  it('shoud create a new user for db', async () => {
    console.log(process.env.DATADB)

    const response = await server.inject({
      method: 'POST',
      url: '/register',
      body:{
        username:"gino",
        password :"pino"
      }
    })
  
    expect(response.statusCode).to.equal(201)

})

it('should not recreate same user', async ()=>{
  const response = await server.inject({
    method: 'POST',
    url: '/register',
    body:{
      username:"gino",
      password :"pino"
    }
  })

  expect(response.statusCode).to.equal(409)

})

it('should login the user just created', async ()=>{
  const response = await server.inject({
    method: 'POST',
    url: '/login',
    body:{
      username:"gino",
      password :"pino"
    }
  })

  expect(response.statusCode).to.equal(200)
  expect((done) => {
      expect(jwt.verify(response.json().access_token,process.env.JWTSECRET).user).to.equal("gino")
      done()
  }).to.not.throw();

})
it('shoud prevent to login with wrong password', async () => {

    const response = await server.inject({
      method: 'post',
      url: '/login',
      body:{
        username:"gino",
        password :"pinoilpulcino"
      }
    })
  
    expect(response.statusCode).to.equal(401) 
})
it('shoud prevent to use the "delete" route if user don\'t have the "admin" role', async () => {
    let response = await server.inject({
      method: 'POST',
      url: '/login',
      body:{
        username:"gino",
        password :"pino"
      }
    })
    response = await server.inject({
      method: 'delete',
      url: '/delete',
      headers:{
        "Authorization":"Bearer "+response.json().access_token
      }
    })
  
    expect(response.statusCode).to.equal(403)
    console.log(response.body)

})
after((done)=>{
   server.close((err) => {
    if (err) {
      console.error('Errore durante la chiusura del server:', err);
    } else {
      console.log('Server chiuso con successo.');
    }
    try{
      fs.rmSync(process.env.USERDB)

     }catch(err){
      console.log(err)
    }
    done()
    //process.exit(1)
  });
})
})
 


 