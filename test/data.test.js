"use strict";
import { expect } from "chai";
import serverBuilder from "../src/server.js";
import fs from "fs";
import jwt from "jsonwebtoken";
const server = serverBuilder(true);
describe("data routes", () => {
	let access_token_u1 = "";
	let access_token_u2 = "";
	let access_token_u2_admin = "";

	before(async () => {
		//create  and login user 1
		let response = await server.inject({
			method: "POST",
			url: "/register",
			body: {
				username: "gino@domain.com",
				password: "giovanni6",
			},
		});

		response = await server.inject({
			method: "POST",
			url: "/login",
			body: {
				username: "gino@domain.com",
				password: "giovanni6",
			},
		});
		access_token_u1 = response.json().access_token;

		//create  and login user 2
		response = await server.inject({
			method: "POST",
			url: "/register",
			body: {
				username: "gino_2@domain.com",
				password: "pinuccio",
			},
		});

		response = await server.inject({
			method: "POST",
			url: "/login",
			body: {
				username: "gino_2@domain.com",
				password: "pinuccio",
			},
		});
		access_token_u2 = response.json().access_token;
		const claims = jwt.verify(access_token_u2, process.env.JWTSECRET);
		claims.roles.push("admin");
		access_token_u2_admin = jwt.sign(claims, process.env.JWTSECRET);
	});

	describe("Creation of data", () => {
		it("Should prevent the creation of a new item with no data.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/data",
				body: {
					key: "test",
					data: "",
				},
				headers: {
					Authorization: "Bearer " + access_token_u1,
				},
			});

			expect(response.statusCode).to.equal(400);
		});
		it("Should prevent the creation of a new item with non base64 format data.", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/data",
				body: {
					key: "test",
					data: "Ciao Gino!",
				},
				headers: {
					Authorization: "Bearer " + access_token_u1,
				},
			});

			expect(response.statusCode).to.equal(400);
		});

		it("Should create a new item in the database belonging to the user.", async () => {
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
		it("Should prevent the creation of a new item for a user with the same key in the database for the same user.", async () => {
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
	});

	describe("Reading of data", () => {
		it("Should read the item that was just created.", async () => {
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
		it("Should prevent User 2 from reading the key belonging to User 1.", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/data/test",
				headers: {
					Authorization: "Bearer " + access_token_u2,
				},
			});

			expect(response.statusCode).to.equal(404);
		});
		it("Should permit an admin User read the data associated with User 1's key.", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/data/test/gino@domain.com",

				headers: {
					Authorization: "Bearer " + access_token_u2_admin,
				},
			});

			expect(response.statusCode).to.equal(200);
		});
	});
	describe("Update of data", () => {
		it("Should prevent update if the new data is not base64 encoded.", async () => {
			const response = await server.inject({
				method: "PATCH",
				url: "/data/test",
				body: {
					data: "Ciao Gino!",
				},
				headers: {
					Authorization: "Bearer " + access_token_u1,
				},
			});

			expect(response.statusCode).to.equal(400);
		});
		it("Should update the item that was just created.", async () => {
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
		it("Should prevent User 2 from updating the data associated with User 1's key.", async () => {
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
		it("Should permit an admin User to update the data associated with User 1's key.", async () => {
			const response = await server.inject({
				method: "PATCH",
				url: "/data/test",
				body: {
					data: "dGVzdDA=",
				},
				headers: {
					Authorization: "Bearer " + access_token_u2_admin,
				},
			});

			expect(response.statusCode).to.equal(200);
		});

		it("Should read the item that was just updated.", async () => {
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
	});
	describe("Deletion of data", () => {
		it("Should prevent User 2 from deleting the item that was just created by User 1.", async () => {
			const response = await server.inject({
				method: "DELETE",
				url: "/data/test",

				headers: {
					Authorization: "Bearer " + access_token_u2,
				},
			});

			expect(response.statusCode).to.equal(404);
		});

		it("Should delete the item that was just created.", async () => {
			const response = await server.inject({
				method: "DELETE",
				url: "/data/test",
				headers: {
					Authorization: "Bearer " + access_token_u1,
				},
			});

			expect(response.statusCode).to.equal(200);
		});

		it("Should not be able to read the item that was just deleted.", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/data/test",
				headers: {
					Authorization: "Bearer " + access_token_u2,
				},
			});

			expect(response.statusCode).to.equal(404);
		});

		it("Should allow an admin to delete a key belonging to another user.", async () => {
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

			response = await server.inject({
				method: "DELETE",
				url: "/data/test/gino@domain.com",
				headers: {
					Authorization: "Bearer " + access_token_u2_admin,
				},
			});

			expect(response.statusCode).to.equal(200);
		});
	});

	describe("Routes autorization", () => {
		it('Should prevent use of data "create" route without autentication.', async () => {
			const response = await server.inject({
				method: "GET",
				url: "/data/test",
				body: {
					key: "test",
					data: "dGVzdA==",
				},
			});

			expect(response.statusCode).to.equal(401);
		});
		it('Should prevent use of data "read" route without autentication.', async () => {
			const response = await server.inject({
				method: "GET",
				url: "/data/test",
			});

			expect(response.statusCode).to.equal(401);
		});
		it('Should prevent use of data "update" route without autentication.', async () => {
			const response = await server.inject({
				method: "PATCH",
				url: "/data/test",
			});

			expect(response.statusCode).to.equal(401);
		});

		it('Should prevent use of data "delete" route without autentication.', async () => {
			const response = await server.inject({
				method: "DELETE",
				url: "/data/test",
			});

			expect(response.statusCode).to.equal(401);
		});
		it("Should prevent an user with valid JWT to data protected routes if is not in the database anymore", async () => {
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

			//try to delete data with valid JWT
			response = await server.inject({
				method: "GET",
				url: "/data/test",
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
				console.error("Server error:", err);
			} else {
				console.log("Server stopped.");
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
