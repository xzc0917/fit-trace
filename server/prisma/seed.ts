import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const presetExercises = [
  // 有氧类
  { name: '爬坡', category: 'cardio', met: 8.0 },
  { name: '爬楼', category: 'cardio', met: 9.0 },
  { name: '划船机', category: 'cardio', met: 7.0 },
  { name: '跑步', category: 'cardio', met: 9.8 },
  { name: '走路', category: 'cardio', met: 3.5 },
  // 力量类
  { name: '哑铃卧推', category: 'strength', met: 5.0 },
  { name: '哑铃上斜卧推', category: 'strength', met: 5.0 },
  { name: '哑铃推肩', category: 'strength', met: 5.0 },
  { name: '哑铃飞鸟', category: 'strength', met: 4.5 },
  { name: '哑铃俯身飞鸟', category: 'strength', met: 4.5 },
  { name: '哑铃前平举', category: 'strength', met: 4.5 },
  { name: '杠铃卧推', category: 'strength', met: 5.5 },
  { name: '杠铃上斜卧推', category: 'strength', met: 5.5 },
  { name: '杠铃推肩', category: 'strength', met: 5.5 },
  { name: '蝴蝶机夹胸', category: 'strength', met: 4.5 },
  { name: '高位下拉', category: 'strength', met: 5.0 },
  { name: '坐姿窄距划船', category: 'strength', met: 5.0 },
  { name: '俯身划船', category: 'strength', met: 5.0 },
  { name: '深蹲', category: 'strength', met: 6.0 },
  { name: '硬拉', category: 'strength', met: 6.0 },
  { name: '引体向上', category: 'strength', met: 6.5 },
  { name: '双杠臂屈伸', category: 'strength', met: 6.0 },
  { name: '倒蹬', category: 'strength', met: 6.0 },
];

async function main() {
  for (const exercise of presetExercises) {
    // 检查是否已存在，避免重复插入
    const exists = await prisma.exerciseLibrary.findUnique({
      where: { name: exercise.name },
    });
    if (!exists) {
      await prisma.exerciseLibrary.create({
        data: {
          ...exercise,
          isCustom: false, // 系统预置
          createdById: null,
        },
      });
    }
  }
  console.log('Preset exercises seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });