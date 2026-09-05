# 越减越肥 🏋️

一个注重身材管理的健身与饮食记录应用。不预设目标，不制造焦虑，通过客观数据记录与分析，帮助用户了解自己的身体变化。

## 🌟 项目亮点

- **不做目标预设**：不设定目标体重/体脂，纯粹记录真实数据
- **AI 智能估算**：使用 DeepSeek 大模型自动估算食物热量和动作 MET 值
- **动作库与训练模板**：内置 30+ 常见健身动作，支持自定义动作和模板一键应用
- **数据可视化**：体重趋势、热量趋势、营养占比等图表展示
- **好友排位与点赞**：好友系统、周消耗排行榜、每日点赞互动
- **响应式设计**：深色主题，玻璃态 UI，适配桌面和移动端

## 🛠 技术栈

### 前端
- React + TypeScript
- Vite
- Tailwind CSS（自定义设计系统）
- Recharts（数据可视化）
- Zustand（状态管理）
- React Router

### 后端
- Node.js + Fastify
- Prisma ORM
- PostgreSQL
- JWT 认证
- DeepSeek API（AI 食物热量估算 & MET 值生成）

### 部署
- Docker + Docker Compose
- 前端：Netlify
- 后端：腾讯云轻量应用服务器（香港）
- 数据库：PostgreSQL 容器化部署
- HTTPS：腾讯云 SSL 证书 + Nginx

## 📁 项目结构
