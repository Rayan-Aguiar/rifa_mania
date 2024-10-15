import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../env";

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ userId: string } | undefined> {
  const token = request.headers["authorization"]?.split(" ")[1];

  if (!token) {
    reply.code(401).send({ message: "Token não fornecido" });
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    request.userId = decoded.userId;
    return decoded
  } catch (error) {
    reply.code(401).send({ message: "Token inválido" });
    return undefined;
  }
}
