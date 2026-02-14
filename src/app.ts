import express, { ErrorRequestHandler, type Express, Response } from "express";
import z, { ZodError } from "zod";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "../prisma/generated/prisma/runtime/client";
import { authRouter } from "./routes/auth";

const app: Express = express();
app.use(express.json());
app.use("/api/auth", authRouter);

app.use(((err, req, res, next) => {

    if (err instanceof PrismaClientKnownRequestError) {
        const dbError = err.meta?.driverAdapterError?.cause;

        if (dbError?.kind === 'UniqueConstraintViolation') {
            const fields = dbError.constraint?.fields || [];

            if (fields.includes('email')) {
                return sendError(res, ["This email is already registered"], 409);
            }
            if (fields.includes('username')) {
                return sendError(res, ["This username is already registered"], 409);
            }
        }
    }

    if (err instanceof PrismaClientValidationError) {
        console.log(err)
        sendError(res, ["Validation Error"], 409)
    }

    if (err instanceof ZodError) {
        const errorStrings = Object.values(z.flattenError(err).fieldErrors).map(err => err).flat()
        sendError(res, errorStrings as string[], 409)
    }

}) as ErrorRequestHandler);

export default app;


function sendError(res: Response, errors: string[], statusCode: number) {
    return res.status(statusCode).json({ errors })
}