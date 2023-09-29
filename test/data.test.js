"use strict";
import { expect } from "chai";
import serverBuilder from "../src/server.js";
import fs from "fs";
import jwt from "jsonwebtoken";
const server = serverBuilder(true);
describe("data routes", () => {
    let access_token_u1 = "";
    let access_token_u2 = "";
    let admin_token = "";
    before(async () => {
        //create  and login user 1
        let response = await server.inject({
            method: "POST",
            url: "/register",
            body: {
                username: "gino",
                password: "pino",
            },
        });

        response = await server.inject({
            method: "POST",
            url: "/login",
            body: {
                username: "gino",
                password: "pino",
            },
        });
        access_token_u1 = response.json().access_token;

        //create  and login user 2
        response = await server.inject({
            method: "POST",
            url: "/register",
            body: {
                username: "gino2",
                password: "pinuccio",
            },
        });

        response = await server.inject({
            method: "POST",
            url: "/login",
            body: {
                username: "gino2",
                password: "pinuccio",
            },
        });
        access_token_u2 = response.json().access_token;
    });
    it("should create a new item for user db", async () => {
        const response = await server.inject({
            method: "POST",
            url: "/data",
            body: {
                key: "test",
                data: "dGVzdA==",
            },
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        expect(response.statusCode).to.equal(201);
    });
    it("should prevent to create  a new item for user with the same key db", async () => {
        const response = await server.inject({
            method: "POST",
            url: "/data",
            body: {
                key: "test",
                data: "dGVzdA==",
            },
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        expect(response.statusCode).to.equal(409);
    });

    it("should read the just created item", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/data/test",
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        expect(response.statusCode).to.equal(200);
        expect(response.body.data === "dGVzdA==");
    });
    it("should prevent user2 to read key from user1", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/data/test",
            headers: {
                Authorization: "Bearer " + access_token_u2,
            },
        });

        expect(response.statusCode).to.equal(404);
    });

    it("should update just created item", async () => {
        const response = await server.inject({
            method: "PATCH",
            url: "/data/test",
            body: {
                data: "dGVzdDE=",
            },
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        expect(response.statusCode).to.equal(200);
    });
    it("should prevent user2 to update key data from user1", async () => {
        const response = await server.inject({
            method: "PATCH",
            url: "/data/test",
            body: {
                data: "333=",
            },
            headers: {
                Authorization: "Bearer " + access_token_u2,
            },
        });

        expect(response.statusCode).to.equal(404);
    });

    it("should read the just updated item", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/data/test",
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        expect(response.statusCode).to.equal(200);
        expect(response.body.data === "dGVzdDE=");
    });
    it("should prevent user2 to delete the just created item from user1", async () => {
        const response = await server.inject({
            method: "PATCH",
            url: "/data/test",
            body: {
                data: "333=",
            },
            headers: {
                Authorization: "Bearer " + access_token_u2,
            },
        });

        expect(response.statusCode).to.equal(404);
    });
    it("should delete the just created item", async () => {
        const response = await server.inject({
            method: "DELETE",
            url: "/data/test",
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        expect(response.statusCode).to.equal(200);
    });

    it("should cant read the just deleted item", async () => {
        const response = await server.inject({
            method: "GET",
            url: "/data/test",
            headers: {
                Authorization: "Bearer " + access_token_u2,
            },
        });

        expect(response.statusCode).to.equal(404);
    });

    it("should permit an admin to delete key from another user", async () => {
        let response = await server.inject({
            method: "POST",
            url: "/data",
            body: {
                key: "test",
                data: "dGVzdA==",
            },
            headers: {
                Authorization: "Bearer " + access_token_u1,
            },
        });

        const claims = jwt.verify(access_token_u2, process.env.JWTSECRET);
        claims.roles.push("admin");
        access_token_u2 = jwt.sign(claims, process.env.JWTSECRET);
        response = await server.inject({
            method: "DELETE",
            url: "/data/test",
            headers: {
                Authorization: "Bearer " + access_token_u2,
            },
        });

        expect(response.statusCode).to.equal(200);
    });
    after((done) => {
        server.close((err) => {
            if (err) {
                console.error("Errore durante la chiusura del server:", err);
            } else {
                console.log("Server chiuso con successo.");
            }
            try {
                fs.rmSync(process.env.USERDB);

                fs.rmSync(process.env.DATADB);
            } catch (err) {
                console.log(err);
            }
            done();

            //process.exit(1);
        });
    });
});
