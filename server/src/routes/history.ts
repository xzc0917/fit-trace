import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function historyRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { from, to } = request.query as { from?: string; to?: string };
    const today = new Date().toISOString().slice(0, 10);
    const fromDate = from || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate = to || today;

    // 获取体重记录
    const weightLogs = await prisma.weightLog.findMany({
      where: {
        userId,
        date: { gte: fromDate, lte: toDate },
      },
      orderBy: { date: 'asc' },
      select: { date: true, weight: true },
    });

    // 获取运动记录按日期汇总
    const exerciseRecords = await prisma.exerciseRecord.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: fromDate, lte: toDate },
      },
      _sum: { caloriesBurned: true },
    });

    // 获取饮食记录按日期汇总
    const foodEntries = await prisma.foodEntry.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: fromDate, lte: toDate },
      },
      _sum: { calories: true },
    });

    // 合并数据为每日对象
    const dateMap = new Map<string, { date: string; weight?: number; caloriesBurned: number; caloriesIntake: number }>();

    // 初始化日期范围（方便补全无数据的日期）
    const start = new Date(fromDate);
    const end = new Date(toDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      dateMap.set(dateStr, { date: dateStr, caloriesBurned: 0, caloriesIntake: 0 });
    }

    // 填充体重
    for (const log of weightLogs) {
      const item = dateMap.get(log.date);
      if (item) item.weight = log.weight;
    }

    // 填充运动消耗
    for (const rec of exerciseRecords) {
      const item = dateMap.get(rec.date);
      if (item) item.caloriesBurned = rec._sum.caloriesBurned || 0;
    }

    // 填充饮食摄入
    for (const food of foodEntries) {
      const item = dateMap.get(food.date);
      if (item) item.caloriesIntake = food._sum.calories || 0;
    }

    // 转换为数组并排序
    const result = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return reply.send(result);
  });
}