import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { estimateFoodNutrition } from '../serivces/aiService';

const prisma = new PrismaClient();

interface AddFoodBody {
  date: string;
  mealType: string;
  foodName: string;
  quantity: number;
  unit: string;
}

export default async function foodRoutes(fastify: FastifyInstance) {
  // 添加饮食记录
  fastify.post('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { date, mealType, foodName, quantity, unit } = request.body as AddFoodBody;

    if (!date || !mealType || !foodName || !quantity || !unit) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // 调用 AI 估算
    const nutrition = await estimateFoodNutrition(foodName, quantity, unit);

    const entry = await prisma.foodEntry.create({
      data: {
        userId,
        date,
        mealType,
        foodName,
        quantity,
        unit,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      },
    });

    return reply.send(entry);
  });

  // 获取指定日期的饮食记录
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { date } = request.query as { date?: string };
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const entries = await prisma.foodEntry.findMany({
      where: { userId, date: targetDate },
      orderBy: { createdAt: 'asc' },
    });
    return reply.send(entries);
  });
}