"use strict";

import { FsHandler } from "../utils/fsHandler.js";
import { sha256 } from "../utils/utils.js";
/**
 * All routes
 */
export default async function (fastify, options) {
	registerUser(fastify, options);
	loginUser(fastify, options);
	deleteUser(fastify, options);
}
//try to be RFC 5322 compliant regex
const emailRegex =
	"^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$";

const userSchema = {
	schema: {
		body: {
			type: "object",
			properties: {
				username: { type: "string", minLength: 3, pattern: emailRegex },
				password: { type: "string", minLength: 6, maxLength: 25 },
			},
		},

		required: ["username", "password"],
	},
};
/**
 * Register a new user to db
 */
function registerUser(fastify, options) {
	fastify.post("/register", userSchema, async (request, reply) => {
		const body = request.body;
		body.password = sha256(body.password);

		const ret = FsHandler.append(
			process.env.USERDB,
			{ ...body, roles: ["user"] },
			(a) => a.username === body.username
		);

		if (ret.status)
			return reply.code(201).send({ message: "user added to db" });
		else if (ret.isServerError) return reply.code(500).send(ret.message);
		else return reply.code(409).send({ message: ret.message });
	});
}
/**
 * Login an user to system and return a jwt token
 */
function loginUser(fastify, options) {
	fastify.post("/login", userSchema, async (request, reply) => {
		let body = request.body;
		body.password = sha256(body.password);

		let ret = FsHandler.read(
			process.env.USERDB,
			(a) => a.password === body.password && a.username === body.username
		);

		if (ret.status) {
			//the user exist and the password is ok
			const token = fastify.jwt.sign({
				user: body.username,
				roles: ret.object.roles,
			});

			return reply.code(200).send({ access_token: token });
		} else if (ret.isServerError) {
			return reply.code(500).send(ret.message);
		} else {
			return reply.code(401).send({ message: ret.message });
		}
	});
}
/**
 * Remove an user from db
 */
function deleteUser(fastify, options) {
	const deleteUserSchema = {
		onRequest: [fastify.authenticate],
		schema: {
			body: {
				type: "object",
				properties: {
					username: { type: "string", pattern: emailRegex },
				},
			},
			required: ["username"],
			errorMessage: {
				required: {
					username: "We need username to delete the user!",
				},
			},
		},
	};

	fastify.delete("/delete", deleteUserSchema, async (request, reply) => {
		if (request.user.roles.includes("admin")) {
			const ret = FsHandler.remove(
				process.env.USERDB,
				(a) => a.username === request.body.username
			);

			if (ret.status) {
				return reply
					.code(200)
					.send({ removed: ret.object[0].username });
			} else if (ret.isServerError) {
				return reply.code(500).send(ret.message);
			} else {
				return reply.code(404).send({ message: ret.message });
			}
		} else {
			return reply
				.code(403)
				.send({ message: "only admin can call this route" });
		}
	});
}
