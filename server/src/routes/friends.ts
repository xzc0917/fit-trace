import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AddFriendBody {
  friendEmail?: string;
  friendNickname?: string;
}

export default async function friendRoutes(fastify: FastifyInstance) {
  // 搜索用户（按昵称或邮箱）
  fastify.get('/search', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q) return reply.send([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { nickname: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, nickname: true, email: true },
      take: 10,
    });

    return reply.send(users);
  });

  // 发送好友请求
  fastify.post('/request', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { friendId } = request.body as { friendId: string };

    if (!friendId || friendId === userId) {
      return reply.status(400).send({ error: 'Invalid friend ID' });
    }

    // 检查是否已是好友或已有请求
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existing) {
      return reply.status(409).send({ error: 'Already friends or request pending' });
    }

    const friend = await prisma.friend.create({
      data: {
        userId,
        friendId,
        status: 'pending',
      },
    });

    return reply.send(friend);
  });

  // 接受好友请求
  fastify.post('/accept', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { friendId } = request.body as { friendId: string };

    const friend = await prisma.friend.findFirst({
      where: {
        userId: friendId,
        friendId: userId,
        status: 'pending',
      },
    });

    if (!friend) {
      return reply.status(404).send({ error: 'Request not found' });
    }

    const updated = await prisma.friend.update({
      where: { id: friend.id },
      data: { status: 'accepted' },
    });

    return reply.send(updated);
  });

  // 获取好友列表（双向）
  fastify.get('/', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const friends = await prisma.friend.findMany({
      where: {
        status: 'accepted',
        OR: [
          { userId: userId },
          { friendId: userId },
        ],
      },
      include: {
        user: { select: { id: true, nickname: true, email: true } },
        friend: { select: { id: true, nickname: true, email: true } },
      },
    });

    // 提取出对方用户（不是当前登录用户）
    const friendList = friends.map(f => f.userId === userId ? f.friend : f.user);
    return reply.send(friendList);
  });

  // 获取收到的好友请求（待处理）
  fastify.get('/requests', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const requests = await prisma.friend.findMany({
      where: {
        friendId: userId,
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, nickname: true, email: true },
        },
      },
    });
    return reply.send(requests.map(r => r.user));
  });

  // 排行榜：本周运动消耗排名（包括自己）
  fastify.get('/ranking', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const from = startOfWeek.toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);

    // 获取双向好友 ID
    const relations = await prisma.friend.findMany({
      where: {
        status: 'accepted',
        OR: [{ userId: userId }, { friendId: userId }],
      },
      select: { userId: true, friendId: true },
    });
    const friendIds = relations.map(r => r.userId === userId ? r.friendId : r.userId);
    const allIds = [userId, ...friendIds];

    // 聚合运动消耗
    const ranking = await prisma.exerciseRecord.groupBy({
      by: ['userId'],
      where: { userId: { in: allIds }, date: { gte: from, lte: to } },
      _sum: { caloriesBurned: true },
    });

    // 获取用户信息
    const users = await prisma.user.findMany({
      where: { id: { in: allIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });

    // 获取今天所有点赞（来自当前用户）
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const myLikes = await prisma.like.findMany({
      where: { userId, createdAt: { gte: todayStart } },
      select: { targetId: true },
    });
    const likedSet = new Set(myLikes.map(l => l.targetId));

    const result = users.map(u => {
      const rec = ranking.find(r => r.userId === u.id);
      return {
        userId: u.id,
        nickname: u.nickname,
        avatarUrl: u.avatarUrl || null,
        totalBurned: rec?._sum.caloriesBurned || 0,
        isMe: u.id === userId,
        liked: likedSet.has(u.id),
      };
    });

    result.sort((a, b) => b.totalBurned - a.totalBurned);
    return reply.send(result);
  });

  // 给好友点赞（每天只能点赞一次）
  fastify.post('/like/:friendId', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { friendId } = request.params as { friendId: string };

    // 确认是好友关系（accepted）
    const friendship = await prisma.friend.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return reply.status(403).send({ error: 'Not friends' });
    }

    // 检查今天是否已点赞
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existing = await prisma.like.findFirst({
      where: {
        userId,
        targetId: friendId,
        createdAt: { gte: todayStart },
      },
    });

    if (existing) {
      return reply.status(409).send({ error: 'Already liked today' });
    }

    const like = await prisma.like.create({
      data: {
        userId,
        targetId: friendId,
      },
    });

    return reply.send({ success: true, like });
  });

  // 获取我收到的点赞
  fastify.get('/likes/received', { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const likes = await prisma.like.findMany({
      where: { targetId: userId },
      include: {
        user: { select: { id: true, nickname: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return reply.send(likes);
  });
}