import buildServer from "./server.js";
const app = buildServer();
app.listen({ port: process.env.PORT }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});
