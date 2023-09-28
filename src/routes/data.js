'use strict'

export default async function (fastify, options) {
    /**
     * create route
     */
    const createSchema = {
      onRequest: [fastify.authenticate],

      schema: {
        body: {
          type: "object",
          properties: {
            key: { type: "string" },
            data: { type: "string" },
          },
        },
    
        required: ['key','data'],
      },
    };
    fastify.post('/data',createSchema, async (request, reply) => {

        const body = request.body;
        

        const ret = FsHandler.append(
          process.env.DATADB,
          {...body,user:request.user.username},
          (a) => a.username === body.username && a.key===body.key
        );

        if (ret.status)
          return reply.code(201).send({ message: "item added to db for user" });
        else if (ret.isServerError)
          return reply.code(500).send( ret.message );
        else 
          return reply.code(409).send({ message: ret.message })
       
    })

    /**
     * read route
     */
    const readSchema = {
      onRequest: [fastify.authenticate],

      schema: {
        params: {
          type: "object",
          properties: {
            key: { type: "string" },
            
          },
        },
    
        required: ['key'],
      },
      
    };
    fastify.get('/data/:key', async (request, reply) => {
        const body = request.params.key;
          

        const ret = FsHandler.read(
          process.env.DATADB,
         
          (a) => a.username === body.username && a.key===body.key
        );

        if (ret.status) {
         
    
          return reply.code(200).send(ret.object[0]);
    
        }
        else if(ret.isServerError)
          return reply.code(500).send(ret.message);
    
        else
          return reply.code(401).send({ message: ret.message });
      })
  
    /**
     * update route
     */
    fastify.patch('/data/:key', async (request, reply) => {
        return { hello: 'world' }
      })

    /**
     * update route
     */
    fastify.delete('/data/:key', async (request, reply) => {
        return { hello: 'world' }
    })
  }
   