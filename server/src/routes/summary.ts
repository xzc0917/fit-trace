import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function summaryRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { date } = request.query as { date?: string };
    const targetDate = date || new Date().toISOString().slice(0, 10);

    // 运动总消耗
    const exerciseAgg = await prisma.exerciseRecord.aggregate({
      where: { userId, date: targetDate },
      _sum: { caloriesBurned: true },
    });

    // 饮食总摄入
    const foodAgg = await prisma.foodEntry.aggregate({
      where: { userId, date: targetDate },
      _sum: { calories: true, protein: true, carbs: true, fat: true },
    });

    // 当日体重
    const weightLog = await prisma.weightLog.findFirst({
      where: { userId, date: targetDate },
      select: { weight: true },
    });

    const totalBurned = exerciseAgg._sum.caloriesBurned || 0;
    const totalIntake = foodAgg._sum.calories || 0;
    const netCalories = totalIntake - totalBurned;

    return reply.send({
      date: targetDate,
      totalBurned,
      totalIntake,
      netCalories,
      protein: foodAgg._sum.protein || 0,
      carbs: foodAgg._sum.carbs || 0,
      fat: foodAgg._sum.fat || 0,
      weight: weightLog?.weight || null,
    });
  });
}