"use strict";
import { FsHandler } from "../utils/fsHandler.js";
import { checkAdminRole } from "../utils/utils.js";
//https://rgxdb.com/r/1NUN74O6 regex bas64 standard
const base64pattern =
	"^(?:[a-zA-Z0-9+/]{4})*(?:|(?:[a-zA-Z0-9+/]{3}=)|(?:[a-zA-Z0-9+/]{2}==)|(?:[a-zA-Z0-9+/]{1}===))$";

/**
 *All routes
 */
export default async function (fastify, options) {
	createData(fastify, options);
	updateData(fastify, options);

	readData(fastify, options);
	deleteData(fastify, options);
}
/**
 * create new data for user in the db
 */
function createData(fastify, options) {
	const createSchema = {
		onRequest: [fastify.authenticate],

		schema: {
			body: {
				type: "object",
				properties: {
					key: { type: "string", minLength: 3 },
					data: {
						type: "string",
						minLength: 1,
						pattern: base64pattern,
					},
				},
			},

			required: ["key", "data"],
		},
	};
	fastify.post("/", createSchema, async (request, reply) => {
		const body = request.body;

		const ret = FsHandler.append(
			process.env.DATADB,
			{ ...body, user: request.user.user },
			(a) => a.user === request.user.user && a.key === body.key
		);

		if (ret.status) {
			return reply
				.code(201)
				.send({ message: "item added to db for user" });
		} else if (ret.isServerError) {
			return reply.code(500).send(ret.message);
		} else {
			return reply.code(409).send({ message: ret.message });
		}
	});
}

/**
 * read data for user in the db with given key
 */
function readData(fastify, options) {
	/**
	 * read route
	 */
	const readSchema = {
		onRequest: [fastify.authenticate],

		schema: {
			params: {
				type: "object",
				properties: {
					key: {
						type: "string",
						minLength: 3,
					},
					user: {
						type: "string",
					},
				},
				required: ["key"],
			},
		},
	};
	fastify.get("/:key/:user?", readSchema, async (request, reply) => {
		const key = request.params.key;
		const user = request.params.user;
		if (user && !checkAdminRole(request)) {
			return reply
				.code(403)
				.send("only admin can read data for another user");
		}
		const ret = FsHandler.read(
			process.env.DATADB,

			getCorrectPredicateFilter(request, key, user)
		);

		if (ret.status) {
			return reply.code(200).send(ret.object);
		} else if (ret.isServerError) {
			return reply.code(500).send(ret.message);
		} else {
			return reply.code(404).send({ message: ret.message });
		}
	});
}
/**
 * update data for user with given key
 */
function updateData(fastify, options) {
	const updateSchema = {
		onRequest: [fastify.authenticate],

		schema: {
			params: {
				type: "object",
				properties: {
					key: {
						type: "string",
						minLength: 3,
					},
					user: {
						type: "string",
					},
				},
				required: ["key"],
			},
			body: {
				type: "object",
				properties: {
					data: {
						type: "string",
						minLength: 1,
						pattern: base64pattern,
					},
				},
				required: ["data"],
			},
		},
	};
	fastify.patch("/:key/:user?", updateSchema, async (request, reply) => {
		const key = request.params.key;
		const newData = request.body.data;
		const user = request.params.user;
		if (user && !checkAdminRole(request)) {
			return reply
				.code(403)
				.send("only admin can update data for another user");
		}
		const ret = FsHandler.update(
			process.env.DATADB,
			{ key: key, data: newData },
			getCorrectPredicateFilter(request, key, user),
			true
		);

		if (ret.status) {
			return reply.code(200).send(ret.object);
		} else if (ret.isServerError) {
			return reply.code(500).send(ret.message);
		} else {
			return reply.code(404).send({ message: ret.message });
		}
	});
}

/**
 * delete data for user with given key
 */
function deleteData(fastify, options) {
	const deleteSchema = {
		onRequest: [fastify.authenticate],

		schema: {
			params: {
				type: "object",
				properties: {
					key: {
						type: "string",
						minLength: 3,
					},
					user: {
						type: "string",
					},
				},
				required: ["key"],
			},
		},
	};
	fastify.delete("/:key/:user?", deleteSchema, async (request, reply) => {
		const key = request.params.key;
		const user = request.params.user;

		if (user && !checkAdminRole(request)) {
			return reply
				.code(403)
				.send("only admin can update data for another user");
		}
		const ret = FsHandler.remove(
			process.env.DATADB,
			getCorrectPredicateFilter(request, key, user)
		);

		if (ret.status) {
			return reply.code(200).send(ret.object[0]);
		} else if (ret.isServerError) {
			return reply.code(500).send(ret.message);
		} else {
			return reply.code(404).send({ message: ret.message });
		}
	});
}
/**
 * Return the filter function if the use have or not have the admin role
 * @param {object} request
 * @param {string} key
 * @returns (a)=>boolean
 */
function getCorrectPredicateFilter(request, key, user = null) {
	let predicate = null;
	if (checkAdminRole(request)) {
		if (user != null) {
			predicate = (a) => a.user === user && a.key === key;
		} else {
			predicate = (a) => a.key === key;
		}
	} else {
		predicate = (a) => a.user === request.user.user && a.key === key;
	}
	return predicate;
}
