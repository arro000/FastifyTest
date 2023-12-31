"use strict";

//init the server with the properly configuration
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
// import fastifySwagger from "fastify-swagger";
import dotenv from "dotenv";
import path from "path";
import userRoutes from "./routes/user.js";
import dataRoutes from "./routes/data.js";
import { FsHandler } from "./utils/fsHandler.js";

export default function buildServer(test = false) {
	//init the configuration variables
	let props = {};
	if (test) {
		dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

		props = { logger: false };
	} else {
		dotenv.config();

		props = {
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
			let token = await request.jwtVerify();

			let check = FsHandler.read(
				process.env.USERDB,
				(a) => a.username === token.user
			);
			if (check.status) {
				return token;
			} else {
				throw "User not exist anymore";
			}
		} catch (err) {
			reply.code(401).send(err);
		}
	});

	//register all the needed routes
	server.register(userRoutes);
	server.register(dataRoutes, { prefix: "/data" });
	return server;
}
