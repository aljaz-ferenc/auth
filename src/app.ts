import express, { type Express } from "express";

const app: Express = express();

app.get("/", (_req, res) => {
	res.json({ message: "Hello" });
});

app.listen(4000, () => {
	console.log("Server is running on port 4000");
});

export default app;
