import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from '@fastify/jwt';

const prisma = new PrismaClient();

// 定义接口参数类型（可选，为了更清晰）
interface RegisterBody {
  email: string;
  password: string;
  nickname: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  // 注册
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { email, password, nickname } = request.body;

    // 简单校验
    if (!email || !password || !nickname) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'Email already exists' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        nickname,
      },
    });

    // 生成 JWT
    const token = fastify.jwt.sign({ userId: user.id, email: user.email });

    return reply.send({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  });

  // 登录
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = fastify.jwt.sign({ userId: user.id, email: user.email });

    return reply.send({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  });

  // 获取当前用户信息（需要认证）
  fastify.get('/me', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId; // JWT 中我们存了 userId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send({ id: user.id, email: user.email, nickname: user.nickname });
  });
}