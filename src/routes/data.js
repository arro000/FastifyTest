"use strict";
import { FsHandler } from "../utils/fsHandler.js";

function createData(fastify, options) {
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

function readData(fastify, options) {
    /**
     * read route
     */
    const readSchema = {
        onRequest: [fastify.authenticate],

        schema: {
            required: ["key"],
        },
    };
    fastify.get("/:key", readSchema, async (request, reply) => {
        const key = request.params.key;

        const ret = FsHandler.read(
            process.env.DATADB,

            (a) => a.user === request.user.user && a.key === key
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

function updateData(fastify, options) {
    /**
     * update route
     */
    const updateSchema = {
        onRequest: [fastify.authenticate],

        schema: {
            required: ["key"],
        },
    };
    fastify.patch("/:key", updateSchema, async (request, reply) => {
        const key = request.params.key;
        const newData = request.body.data;

        const ret = FsHandler.update(
            process.env.DATADB,
            { key: key, data: newData, user: request.user.user },
            (a) => a.user === request.user.user && a.key === key
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
function deleteData(fastify, options) {
    /**
     * update route
     */
    const deleteSchema = {
        onRequest: [fastify.authenticate],

        schema: {
            required: ["key"],
        },
    };
    fastify.delete("/:key", deleteSchema, async (request, reply) => {
        const key = request.params.key;

        let predicate = null;
        if (request.user.roles.includes("admin")) {
            predicate = (a) => a.key === key;
        } else {
            predicate = (a) => a.user === request.user.user && a.key === key;
        }
        const ret = FsHandler.remove(process.env.DATADB, predicate);

        if (ret.status) {
            return reply.code(200).send(ret.object[0]);
        } else if (ret.isServerError) {
            return reply.code(500).send(ret.message);
        } else {
            return reply.code(404).send({ message: ret.message });
        }
    });
}

export default async function (fastify, options) {
    createData(fastify, options);
    updateData(fastify, options);

    readData(fastify, options);
    deleteData(fastify, options);
}
