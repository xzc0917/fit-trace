import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import exerciseRoutes from './routes/exercises';
import recordRoutes from './routes/records';
import foodRoutes from './routes/food';
import weightRoutes from './routes/weight';
import summaryRoutes from './routes/summary';
import historyRoutes from './routes/history';
import friendRoutes from './routes/friends';
import 'dotenv/config';
import templateRoutes from './routes/templates';
const fastify = Fastify();
const prisma = new PrismaClient();

// 注册 CORS（只需要一次，使用宽松配置以便开发）
fastify.register(cors, {
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
});

// 注册 JWT 插件，设置密钥
fastify.register(jwt, {
  secret: 'your-secret-key-change-me',
});

// 添加认证装饰器：用于保护路由
fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// 测试路由
fastify.get('/', async () => {
  return { message: 'FitTrace API is running' };
});

// 用户数量测试
fastify.get('/users/count', async () => {
  const count = await prisma.user.count();
  return { userCount: count };
});

// 注册认证路由
fastify.register(authRoutes, { prefix: '/api/auth' });
// 注册用户路由
fastify.register(userRoutes, { prefix: '/api/user' });

fastify.register(exerciseRoutes, { prefix: '/api/exercises' });
fastify.register(recordRoutes, { prefix: '/api/records' });

fastify.register(foodRoutes, { prefix: '/api/food' });
fastify.register(weightRoutes, { prefix: '/api/weight' });
fastify.register(summaryRoutes, { prefix: '/api/summary' });
fastify.register(historyRoutes, { prefix: '/api/history' });
fastify.register(friendRoutes, { prefix: '/api/friends' });
fastify.register(templateRoutes, { prefix: '/api/templates' });
// 启动服务器
const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log('Server running at http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();