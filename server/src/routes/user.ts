import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateProfileBody {
  nickname?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
}

export default async function userRoutes(fastify: FastifyInstance) {
  // 获取当前用户资料
  fastify.get('/profile', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        height: true,
        weight: true,
        age: true,
        gender: true,
        createdAt: true,
      },
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return reply.send(user);
  });

  // 更新用户资料
  fastify.put<{ Body: UpdateProfileBody }>('/profile', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { nickname, height, weight, age, gender } = request.body;

    // 只更新传入的字段
    const data: any = {};
    if (nickname !== undefined) data.nickname = nickname;
    if (height !== undefined) data.height = height;
    if (weight !== undefined) data.weight = weight;
    if (age !== undefined) data.age = age;
    if (gender !== undefined) data.gender = gender;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        nickname: true,
        height: true,
        weight: true,
        age: true,
        gender: true,
        createdAt: true,
      },
    });

    return reply.send(updated);
  });
}