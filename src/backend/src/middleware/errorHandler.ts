import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../utils/errors";


export const globalErrorHandler = (
err: FastifyError | AppError,
request: FastifyRequest,
reply: FastifyReply
) => {
  if (err instanceof AppError) {
    return reply.code(err.statusCode).send({ message: err.message });
  }

  if (err.validation) {
    return reply.code(400).send({ message: err.message });
  }

  if (err.statusCode && err.statusCode < 500) {
    return reply.code(err.statusCode).send({ message: err.message });
  }

  request.log.error(err);
  
  return reply.code(500).send({ message: 'Internal Server Error' });
}