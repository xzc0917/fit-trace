import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AddRecordBody {
  exerciseId: number;
  date: string;
  sets?: number;
  reps?: number;
  weight?: number;
  durationMin?: number;
}

export default async function recordRoutes(fastify: FastifyInstance) {
  // 添加运动记录，并自动计算热量
  fastify.post('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { exerciseId, date, sets, reps, weight, durationMin } = request.body as AddRecordBody;

    // 获取动作库中的 MET 值
    const exercise = await prisma.exerciseLibrary.findUnique({ where: { id: exerciseId } });
    if (!exercise) {
      return reply.status(404).send({ error: 'Exercise not found' });
    }

    // 获取用户信息（体重）
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // 如果用户没有填写体重，使用默认 70kg
    const bodyWeight = user.weight || 70;

    let caloriesBurned = 0;

    if (exercise.category === 'cardio' && durationMin) {
      // 有氧运动：MET × 体重(kg) × 时间(小时)
      caloriesBurned = exercise.met * bodyWeight * (durationMin / 60);
    } else if (exercise.category === 'strength') {
      if (weight && sets && reps) {
        // 力量训练：重量 × 组数 × 次数 × 0.1（更准确的经验公式）
        caloriesBurned = weight * sets * reps * 0.1;
      } else if (sets && reps) {
        // 没有重量时，使用 MET 估算，假设每组约 30 秒
        const totalTimeMin = sets * reps * 0.5;
        caloriesBurned = exercise.met * bodyWeight * (totalTimeMin / 60);
      } else {
        caloriesBurned = 0;
      }
    }

    // 确保热量值有效
    caloriesBurned = Math.round(caloriesBurned * 10) / 10;

    const record = await prisma.exerciseRecord.create({
      data: {
        userId,
        exerciseId,
        date,
        sets: sets || null,
        reps: reps || null,
        weight: weight || null,
        durationMin: durationMin || null,
        caloriesBurned,
      },
    });

    return reply.send(record);
  });

  // 获取指定日期的运动记录
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { date } = request.query as { date?: string };
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const records = await prisma.exerciseRecord.findMany({
      where: { userId, date: targetDate },
      include: { exercise: true },
      orderBy: { createdAt: 'asc' },
    });
    return reply.send(records);
  });

  // 删除运动记录
  fastify.delete('/:id', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    const record = await prisma.exerciseRecord.findFirst({
      where: { id: Number(id), userId },
    });

    if (!record) {
      return reply.status(404).send({ error: 'Record not found' });
    }

    await prisma.exerciseRecord.delete({ where: { id: Number(id) } });
    return reply.send({ success: true });
  });
}