import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { estimateMETWithAI } from '../serivces/aiService';
const prisma = new PrismaClient();

export default async function exerciseRoutes(fastify: FastifyInstance) {
  // 获取动作库（所有预置 + 当前用户自定义）
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const exercises = await prisma.exerciseLibrary.findMany({
      where: {
        OR: [
          { isCustom: false }, // 系统预置
          { createdById: userId }, // 用户自定义
        ],
      },
      orderBy: { category: 'asc' },
    });
    return reply.send(exercises);
  });

  // 创建自定义动作

// 创建自定义动作
  fastify.post('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { name, category } = request.body as { name: string; category: string };

    if (!name || !category) {
    return reply.status(400).send({ error: 'Missing required fields' });
    }

  // AI 自动估算 MET 值
    const met = await estimateMETWithAI(name, category);

    try {
      const newExercise = await prisma.exerciseLibrary.create({
        data: {
          name,
          category,
          met,
          isCustom: true,
          createdById: userId,
        },
      });
      return reply.send(newExercise);
    } catch (err) {
      return reply.status(500).send({ error: 'Could not create exercise' });
    } 
  });
  // 更新自定义动作
fastify.put('/:id', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { id } = request.params as { id: string };
  const { name, category } = request.body as { name: string; category: string };

  const exercise = await prisma.exerciseLibrary.findFirst({
    where: { id: Number(id), createdById: userId, isCustom: true },
  });

  if (!exercise) {
    return reply.status(404).send({ error: 'Custom exercise not found' });
  }

  // 如果名称或类型变了，重新用 AI 估算 MET 值
  let met = exercise.met;
  if (name !== exercise.name || category !== exercise.category) {
    met = await estimateMETWithAI(name, category);
  }

  const updated = await prisma.exerciseLibrary.update({
    where: { id: Number(id) },
    data: { name, category, met },
  });

  return reply.send(updated);
});

// 删除自定义动作
fastify.delete('/:id', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
  const userId = (request.user as any).userId;
  const { id } = request.params as { id: string };

  const exercise = await prisma.exerciseLibrary.findFirst({
    where: { id: Number(id), createdById: userId, isCustom: true },
  });

  if (!exercise) {
    return reply.status(404).send({ error: 'Custom exercise not found' });
  }

  await prisma.exerciseLibrary.delete({ where: { id: Number(id) } });
  return reply.send({ success: true });
});
}