'use strict'
import {expect } from "chai" 
import serverBuilder from "../src/server.js"
import fs from "fs"

const server= serverBuilder(true)
describe('data routes', () => {
  let access_token_u1=""
  let access_token_u2=""
  let admin_token=""
  before(async ()=>{
    //create  and login user 1
    let response = await server.inject({
      method: 'POST',
      url: '/register',
      body:{
        key:"gino",
        data :"pino"
      }
    })

    response = await server.inject({
      method: 'POST',
      url: '/login',
      body:{
        key:"gino",
        data :"pino"
      }
    })
    access_token_u1=response.body.access_token

    //create  and login user 2
    response = await server.inject({
      method: 'POST',
      url: '/register',
      body:{
        key:"gino2",
        data :"pinuccio"
      }
    })

    response = await server.inject({
      method: 'POST',
      url: '/login',
      body:{
        key:"gino2",
        data :"pinuccio"
      }
    })
    access_token_u1=response.body.access_token


  })
  it('should create a new item for user db', async () => {
    

    const response = await server.inject({
      method: 'POST',
      url: '/data',
      body:{
        key:"test",
        data :"dGVzdA=="
      }

    })
  
 
    expect(response.statusCode).to.equal(201);
})

it('should read the just created item', async () => {

  const response = await server.inject({
    method: 'GET',
    url: '/data/test',
    
  })

  expect(response.statusCode).to.equal( 200)
  expect(response.body.data ==='dGVzdA==' )
})

it('should update just created item', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url: '/data/test',
      body:{
        data:'dGVzdDE='
      }
    })
  
    expect(response.statusCode).to.equal(200)

})

it('should read the just updated item', async () => {

    const response = await server.inject({
      method: 'GET',
      url: '/data/test',
      
    })

    expect(response.statusCode).to.equal(200)
    expect(response.body.data ==='dGVzdDE=' )
})

it('should delete the just created item', async () => {

  const response = await server.inject({
    method: 'DELETE',
    url: '/data/test',
    
  })

  expect(response.statusCode).to.equal(200) 
})

it('should cant read the just deleted item', async () => {

  const response = await server.inject({
    method: 'GET',
    url: '/data/test',
    
  })

  expect(response.statusCode).to.equal(404) 
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

      fs.rmSync(process.env.DATADB)
    }catch(err){
      console.log(err)
    }
   
    done()
    //process.exit(1)
  });


 
})
})

 


 
 