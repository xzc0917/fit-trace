import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AddWeightBody {
  date: string;
  weight: number;
}

export default async function weightRoutes(fastify: FastifyInstance) {
  // 添加或更新当日体重（若当日已存在则更新）
  fastify.post('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { date, weight } = request.body as AddWeightBody;

    if (!date || !weight) {
      return reply.status(400).send({ error: 'Missing date or weight' });
    }

    // 查找当日是否已记录
    const existing = await prisma.weightLog.findFirst({
      where: { userId, date },
    });

    let log;
    if (existing) {
      log = await prisma.weightLog.update({
        where: { id: existing.id },
        data: { weight },
      });
    } else {
      log = await prisma.weightLog.create({
        data: { userId, date, weight },
      });
    }

    return reply.send(log);
  });

  // 获取指定日期范围的体重记录（默认最近30天）
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { from, to } = request.query as { from?: string; to?: string };
    const today = new Date().toISOString().slice(0, 10);
    const fromDate = from || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate = to || today;

    const logs = await prisma.weightLog.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return reply.send(logs);
  });
}