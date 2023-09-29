"use strict";

//init the server with the properly configuration
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import userRoutes from "./routes/user.js";
import dataRoutes from "./routes/data.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

export default function buildServer(test = true) {
  //init the configuration variables
  let props = {};
  if (test) {
    props = { logger: false };
  } else {
    dotenv.config();
    props ==
      {
        logger: {
          level: "info",
        },
      };
  }

  //load configuration to fastify to create an instance
  const server = fastify(props);

  //setup autentication plugin
  server.register(fastifyJwt, {
    secret: process.env.JWTSECRET,
    sign: {
      expiresIn: "10m",
    },
  });
  server.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  //register all the needed routes
  server.register(userRoutes);
  server.register(dataRoutes);
  return server;
}

const app = buildServer()
app.listen({ port: process.env.PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
