'use strict'


import userRoutes from "../routes/user.js" 
 
const testRegister= async () =>{
    const app = userRoutes()

    const response = await app.inject({
      method: 'post',
      url: '/register'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}

const testLogin= async () =>{
    const app = userRoutes()

    const response = await app.inject({
      method: 'post',
      url: '/login'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}
const testDelete= async () =>{
    const app = userRoutes()

    const response = await app.inject({
      method: 'delete',
      url: '/delete'
    })
  
    console.log('status code: ', response.statusCode)
    console.log('body: ', response.body)
}

export default  async function test(){
    await testRegister()
    await testLogin()

    await testDelete()

}
 


 