"use strict";
import { expect } from "chai";
import fs from "fs";
import serverBuilder from "../src/server.js";
import jwt from "jsonwebtoken";

const server = serverBuilder(true);
describe("User routes", () => {
	describe("Creation on user", () => {
		it("Should prevent the creation of a new user with a password that is too short.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "gino@domain.com",
					password: "giova",
				},
			});

			expect(response.statusCode).to.equal(400);
		});
		it("Should prevent the creation of a new user with a name that is too short.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "i",
					password: "giovanni6",
				},
			});

			expect(response.statusCode).to.equal(400);
		});
		it("Should prevent the creation of a new user with a name that is not an email.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "gino_69",
					password: "giovanni6",
				},
			});

			expect(response.statusCode).to.equal(400);
		});
		it("Should create a new user in the database.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});

			expect(response.statusCode).to.equal(201);
		});

		it("Should not allow the creation of the same user again.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});

			expect(response.statusCode).to.equal(409);
		});
	});
	describe("Login of user", () => {
		it("Should successfully log in the user who was just created.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/login",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});

			expect(response.statusCode).to.equal(200);

			expect(
				jwt.verify(response.json().access_token, process.env.JWTSECRET)
					.user
			).to.equal("gino@domain.com");
		});
		it("Should prevent login with an incorrect password.", async () => {
			const response = await server.inject({
				method: "post",
				url: "/login",
				body: {
					username: "gino@domain.com",
					password: "pinoilpulcino",
				},
			});

			expect(response.statusCode).to.equal(401);
		});
	});

	describe("Deletion of user", () => {
		it('Should prevent the use of the user "delete" route without autentication.', async () => {
			const response = await server.inject({
				method: "DELETE",
				url: "/delete",
				body: {
					username: "gino@domain.com",
				},
			});

			expect(response.statusCode).to.equal(401);
		});
		it('Should prevent the use of the user "delete" route if the user does not have the "admin" role.', async () => {
			let response = await server.inject({
				method: "POST",
				url: "/login",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});
			const token = response.json().access_token;
			response = await server.inject({
				method: "DELETE",
				url: "/delete",
				body: {
					username: "gino@domain.com",
				},
				headers: {
					Authorization: "Bearer " + token,
				},
			});

			expect(response.statusCode).to.equal(403);
		});
		it('Should allow access to the "delete" route if the user has the "admin" role.', async () => {
			let response = await server.inject({
				method: "POST",
				url: "/login",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});

			//manipulate jwt to have an user with admin role
			let token = response.json().access_token;
			const claims = jwt.verify(token, process.env.JWTSECRET);
			claims.roles.push("admin");
			token = jwt.sign(claims, process.env.JWTSECRET);

			response = await server.inject({
				method: "DELETE",
				url: "/delete",
				body: {
					username: "gino@domain.com",
				},
				headers: {
					Authorization: "Bearer " + token,
				},
			});

			expect(response.statusCode).to.equal(200);
		});

		it("Should prevent an user with valid JWT to user protected routes if is not in the database anymore", async () => {
			//register new user (just deleted)
			let response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});
			//register new user2 (just deleted)
			response = await server.inject({
				method: "POST",
				url: "/register",
				body: {
					username: "gino_2@domain.com",
					password: "giovanni6",
				},
			});
			//login the new user

			response = await server.inject({
				method: "POST",
				url: "/login",
				body: {
					username: "gino@domain.com",
					password: "giovanni6",
				},
			});

			//manipulate jwt to have an user with admin role
			let token = response.json().access_token;
			const claims = jwt.verify(token, process.env.JWTSECRET);
			claims.roles.push("admin");
			token = jwt.sign(claims, process.env.JWTSECRET);

			//self delete from db
			response = await server.inject({
				method: "DELETE",
				url: "/delete",
				body: {
					username: "gino@domain.com",
				},
				headers: {
					Authorization: "Bearer " + token,
				},
			});

			//try to delete another user with valid JWT
			response = await server.inject({
				method: "DELETE",
				url: "/delete",
				body: {
					username: "gino_2@domain.com",
				},
				headers: {
					Authorization: "Bearer " + token,
				},
			});

			expect(response.statusCode).to.equal(401);
		});
	});

	after((done) => {
		server.close((err) => {
			if (err) {
				console.error("Server error::", err);
			} else {
				console.log("Server stopped.");
			}
			try {
				fs.rmSync(process.env.USERDB);
			} catch (err) {
				console.log(err);
			}
			//process.exit(1);
			done();
		});
	});
});
