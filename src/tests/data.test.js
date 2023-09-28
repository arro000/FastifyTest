'use strict'

import dataRoutes from "../routes/data.js" 
const app = dataRoutes()
const testCreate= async () =>{
  

    const response = await app.inject({
      method: 'POST',
      url: '/data'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}

const testRead= async () =>{ 

    const response = await app.inject({
      method: 'GET',
      url: '/data/'+1
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}
const testUpdate= async () =>{ 

    const response = await app.inject({
      method: 'PATCH',
      url: '/data/'+1
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}
const testDelete= async () =>{ 

    const response = await app.inject({
        method: 'DELETE',
        url: '/data/'+1
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}

export default  async function test() {
    await testCreate()
    await testRead()
    await testUpdate()
    await testDelete()

}
 


 
 