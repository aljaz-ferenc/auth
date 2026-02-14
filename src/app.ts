import express, { type Express } from "express";

const app: Express = express();

app.get("/", (_req, res) => {
	res.json({ message: "Hello" });
});

export default app;
