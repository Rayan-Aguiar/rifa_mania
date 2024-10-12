import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../../env";
import { hashPassword } from "../../utils/hashPassword";
import { verifyToken } from "../../middlewares/verifyToken";


interface LoginRequest {
  email: string;
  password: string;
}


interface DecodedToken {
  userId: string;
}

interface UserUpdateRequest {
  name?: string;
  phone?: string;
  cpf?: string; 
}

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().min(3),
});


export async function userRoutes(app: FastifyInstance) {
  
  app.post("/users", async (request, reply) => {
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


  app.post("/auth/login", async (request: FastifyRequest<{ Body: LoginRequest }>, reply) => {
    const { email, password } = request.body;

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
  });


  app.delete('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      return reply.code(401).send({ message: 'Token não fornecido' });
    }

    try {
      const decoded = await verifyToken(token) as DecodedToken;
      const { userId } = decoded;

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }

      await prisma.user.delete({ where: { id: userId } });
      reply.code(204).send({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      reply.code(500).send({ message: 'Internal server error' });
    }
  });


  app.put('/users', async (request: FastifyRequest<{ Body: UserUpdateRequest }>, reply: FastifyReply) => {
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      return reply.code(401).send({ message: 'Token não fornecido' });
    }

    try {
      const decoded = await verifyToken(token) as DecodedToken;
      const { userId } = decoded;

      const userData: UserUpdateRequest = request.body;
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });

      if(!existingUser) {
        return reply.code(404).send({ message: 'Usuário não encontrado' })
      }

      if (userData.cpf && existingUser.cpf) {
        return reply.code(400).send({ message: 'O CPF não pode ser editado uma vez que foi cadastrado.' });
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
      console.error('Erro ao editar usuário:', error);
      reply.code(500).send({ message: 'Internal server error' });
    }
  });

  app.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return reply.code(401).send({ message: 'Token não fornecido' });
    }
  
    try {
      const decoded = await verifyToken(token) as DecodedToken;
      const { userId } = decoded;
  
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
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }
  
      reply.send(existingUser);
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      reply.code(500).send({ message: 'Internal server error' });
    }
  });

  app.put('/users/password', async (request: FastifyRequest<{ Body: { currentPassword: string; newPassword: string } }>, reply: FastifyReply) => {
    const token = request.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return reply.code(401).send({ message: 'Token não fornecido' });
    }
  
    try {
      const decoded = await verifyToken(token) as DecodedToken;
      const { userId } = decoded;
  
      const { currentPassword, newPassword } = request.body;
  
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  
      if (!existingUser) {
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }
  
      const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isPasswordValid) {
        return reply.code(401).send({ message: 'Senha atual inválida' });
      }
  
 
      const hashedNewPassword = await hashPassword(newPassword);
  

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
  
      reply.code(204).send(); 
    } catch (error) {
      console.error('Erro ao editar senha do usuário:', error);
      reply.code(500).send({ message: 'Internal server error' });
    }
  });
}
