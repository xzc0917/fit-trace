import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTemplateBody {
  name: string;
  exercises: {
    exerciseId: number;
    sets?: number;
    reps?: number;
    weight?: number;
    durationMin?: number;
    order?: number;
  }[];
}

export default async function templateRoutes(fastify: FastifyInstance) {
  // 获取当前用户的所有模板
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const templates = await prisma.workoutTemplate.findMany({
      where: { userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(templates);
  });

  // 创建新模板
  fastify.post('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { name, exercises } = request.body as CreateTemplateBody;

    if (!name || !exercises || exercises.length === 0) {
      return reply.status(400).send({ error: 'Missing name or exercises' });
    }

    const template = await prisma.workoutTemplate.create({
      data: {
        userId,
        name,
        exercises: {
          create: exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets || null,
            reps: ex.reps || null,
            weight: ex.weight || null,
            durationMin: ex.durationMin || null,
            order: ex.order ?? index,
          })),
        },
      },
      include: { exercises: { include: { exercise: true } } },
    });

    return reply.send(template);
  });

  // 应用模板到今日运动记录
  fastify.post('/:id/apply', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const { date } = request.body as { date?: string };
    const targetDate = date || new Date().toISOString().slice(0, 10);

    // 获取用户体重
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const bodyWeight = user?.weight || 70;

    const template = await prisma.workoutTemplate.findFirst({
      where: { id: Number(id), userId },
      include: { exercises: true },
    });

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    const records = [];

    for (const item of template.exercises) {
      const exercise = await prisma.exerciseLibrary.findUnique({ where: { id: item.exerciseId } });
      if (!exercise) continue;

      let caloriesBurned = 0;

      if (exercise.category === 'cardio' && item.durationMin) {
        // 有氧运动：MET × 体重(kg) × 时间(小时)
        caloriesBurned = exercise.met * bodyWeight * (item.durationMin / 60);
      } else if (exercise.category === 'strength') {
        if (item.weight && item.sets && item.reps) {
          // 力量训练有重量：重量 × 组数 × 次数 × 0.1
          caloriesBurned = item.weight * item.sets * item.reps * 0.1;
        } else if (item.sets && item.reps) {
          // 力量训练无重量：MET × 体重 × 估算时间（每组约 30 秒）
          const totalTimeMin = item.sets * item.reps * 0.5;
          caloriesBurned = exercise.met * bodyWeight * (totalTimeMin / 60);
        }
      }

      caloriesBurned = Math.round(caloriesBurned * 10) / 10;

      const record = await prisma.exerciseRecord.create({
        data: {
          userId,
          exerciseId: item.exerciseId,
          date: targetDate,
          sets: item.sets || null,
          reps: item.reps || null,
          weight: item.weight || null,
          durationMin: item.durationMin || null,
          caloriesBurned,
        },
      });
      records.push(record);
    }

    return reply.send({ success: true, count: records.length, records });
  });

  // 删除模板
  fastify.delete('/:id', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    const template = await prisma.workoutTemplate.findFirst({
      where: { id: Number(id), userId },
    });

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    await prisma.workoutTemplate.delete({ where: { id: Number(id) } });
    return reply.send({ success: true });
  });
}