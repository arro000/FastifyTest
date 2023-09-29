"use strict";

//init the server with the properly configuration
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
// import fastifySwagger from "fastify-swagger";
import dotenv from "dotenv";

import userRoutes from "./routes/user.js";
import dataRoutes from "./routes/data.js";

export default function buildServer(test = false) {
	//init the configuration variables
	let props = {};
	if (test) {
		dotenv.config({ path: ".env.test" });

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

	//setup documentation endpoint
	// server.register(fastifySwagger, {
	// 	routePrefix: "/documentation",
	// 	swagger: {
	// 		info: {
	// 			title: "Test API",
	// 			description: "Documentazione API per il mio progetto",
	// 			version: "1.0.0",
	// 		},
	// 		externalDocs: {
	// 			url: "https://swagger.io",
	// 			description: "Trova ulteriori informazioni qui",
	// 		},
	// 		host: "localhost:3000",
	// 	},
	// });

	//setup autentication plugin
	server.register(fastifyJwt, {
		secret: process.env.JWTSECRET,
		sign: {
			expiresIn: "10m",
		},
	});
	//add the new function to fastify instance
	server.decorate("authenticate", async function (request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	//register all the needed routes
	server.register(userRoutes);
	server.register(dataRoutes, { prefix: "/data" });
	return server;
}

const app = buildServer();
app.listen({ port: process.env.PORT }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});
