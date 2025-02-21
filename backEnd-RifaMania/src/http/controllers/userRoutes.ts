import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { hashPassword } from "../../utils/hashPassword";
import { verifyToken } from "../../middlewares/verifyToken";
import { encrypt } from "../../utils/cryptoUtils";

interface UserUpdateRequest {
  name?: string;
  phone?: string;
  cpf?: string;
}

interface PasswordChangeBody {
  currentPassword: string;
  newPassword: string;
}

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().min(3),
});

export async function userRoutes(app: FastifyInstance) {
  app.post("/users", {
    schema: {
      description: "Cria um novo usuário",
      tags: ["Users"],
      body: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          cpf: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          name: { type: "string", minLength: 3 },
        },
        required: ["email", "password", "name"],
      },
      response: {
        201: {
          description: "Usuário criado com sucesso",
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            name: { type: "string" },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userData = userSchema.parse(request.body);
      const hashedPassword = await hashPassword(userData.password);

      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          cpf: userData.cpf || "",
          phone: userData.phone || "",
        },
      });

      reply.code(201).send(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Erro ao criar usuário:", error);
        reply.code(400).send({ message: error.errors });
      } else {
        console.error("Erro ao criar usuário:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  });

  app.delete(
    "/users",
    {
      preHandler: [verifyToken],
      schema: {
        description: "Deleta o usuário autenticado",
        tags: ["Users"],
        response: {
          204: {
            description: "Usuário deletado com sucesso",
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const decoded = await verifyToken(request, reply);
        if (!decoded) {
          return;
        }

        const { userId } = decoded;

        const userExists = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!userExists) {
          return reply.code(404).send({ message: "Usuário não encontrado" });
        }

        await prisma.user.delete({ where: { id: userId } });
        reply.code(204).send({ message: "Usuário deletado com sucesso" });
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.put<{ Body: UserUpdateRequest }>(
    "/users",
    {
      preHandler: [verifyToken],
      schema: {
        description: "Atualiza os dados do usuário autenticado",
        tags: ["Users"],
        body: {
          type: "object",
          properties: {
            name: { type: "string", nullable: true },
            phone: { type: "string", nullable: true },
            cpf: { type: "string", nullable: true },
          },
        },
        response: {
          200: {
            description: "Usuário atualizado com sucesso",
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string" },
              phone: { type: "string" },
              cpf: { type: "string" },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: UserUpdateRequest }>,
      reply: FastifyReply
    ) => {
      try {
        const { userId } = request;
        const userData: UserUpdateRequest = request.body;

        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          return reply.code(404).send({ message: "Usuário não encontrado" });
        }

        if (userData.cpf && existingUser.cpf) {
          return reply.code(400).send({
            message: "O CPF não pode ser editado uma vez que foi cadastrado.",
          });
        }

        if (userData.cpf === undefined) {
          delete userData.cpf;
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: userData,
        });

        reply.send(updatedUser);
      } catch (error) {
        console.error("Erro ao editar usuário:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.get(
    "/users",
    {
      preHandler: [verifyToken],
      schema: {
        description: "Obtém os dados do usuário autenticado",
        tags: ["Users"],
        response: {
          200: {
            description: "Dados do usuário",
            type: "object",
            properties: {
              email: { type: "string" },
              name: { type: "string" },
              phone: { type: "string" },
              cpf: { type: "string" },
            },
          },
        },
      },
    },    
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            email: true,
            name: true,
            phone: true,
            cpf: true,
          },
        });

        if (!existingUser) {
          return reply.code(404).send({ message: "Usuário não encontrado" });
        }

        reply.send(existingUser);
      } catch (error) {
        console.error("Erro ao obter dados do usuário:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.put<{ Body: PasswordChangeBody }>(
    "/users/password",
    { 
      preHandler: [verifyToken],
      schema: {
        description: 'Permite o usuário alterar sua senha atual',
        tags: ['Users'],
        body: {
          type: 'object',
          properties: {
            currentPassword: { type:'string', description: 'Senha atual do usuário' },
            newPassword: { type:'string', minLength: 8 , description: "Nova senha do usuário"},
          },
          required: ['currentPassword', 'newPassword'],
        },
        response: {
          204: { description: "Senha alterada com sucesso" },
          400: { description: "Senha atual inválida ou erro de validação" },
          404: { description: "Usuário não encontrado" },
          500: { description: "Erro interno do servidor" },
        }
      } 
    },
    async (
      request: FastifyRequest<{ Body: PasswordChangeBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { userId } = request;
        const { currentPassword, newPassword } = request.body;

        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          return reply.code(404).send({ message: "Usuário não encontrado" });
        }

        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          existingUser.password
        );

        if (!isPasswordValid) {
          return reply.code(400).send({ message: "Senha atual inválida" });
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });

        reply.code(204).send();
      } catch (error) {
        console.error("Erro ao editar senha do usuário:", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  app.patch(
    "/users/accessToken",
    {
      preHandler: [verifyToken],
      schema: {
        description: "Atualiza o access token do usuário.",
        tags: ["Users"],
        body: {
          type: "object",
          required: ["accessToken"],
          properties: {
            accessToken: { type: "string", description: "Novo access token" },
          },
        },
        response: {
          200: { description: "Access token atualizado com sucesso" },
          400: { description: "Access token obrigatório" },
          500: { description: "Erro interno do servidor" },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request;
      const { accessToken } = request.body as { accessToken: string };

      if (!accessToken) {
        return reply.code(400).send({ message: "Access token obrigatório" });
      }

      try {
        const encryptedToken = encrypt(accessToken);

        await prisma.user.update({
          where: { id: userId },
          data: { accessToken: encryptedToken },
        });

        reply.send({ message: "Access token atualizado com sucesso" });
      } catch (error) {
        console.error("Erro ao atualizar o access token:", error);
        reply.code(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
}
