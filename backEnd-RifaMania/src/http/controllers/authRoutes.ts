import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../../env";
import { hashPassword } from "../../utils/hashPassword";

interface LoginRequest {
  email: string;
  password: string;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/auth/login",
    async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
      try {
        const { email, password } = loginSchema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          return reply.code(401).send({ message: "Email ou senha inválidos" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return reply.code(401).send({ message: "Email ou senha inválidos" });
        }

        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
          expiresIn: "1h",
        });
        reply.send({ token });
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );
}