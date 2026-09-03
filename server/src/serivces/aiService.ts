import axios from 'axios';

// 从环境变量读取 AI 配置
const AI_API_KEY = process.env.AI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

// 模拟数据（作为降级方案）
const mockNutrition: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  '鸡胸肉': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  '米饭': { calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3 },
  '鸡蛋': { calories: 144, protein: 13, carbs: 2, fat: 10 },
  '牛肉': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  '牛奶': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  '苹果': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
};

function safeNumber(value: number): number {
  return isFinite(value) ? value : 0;
}

// AI 估算食物营养
async function estimateWithAI(foodName: string, quantity: number, unit: string) {
  if (!AI_API_KEY) {
    throw new Error('AI_API_KEY not configured');
  }

  const prompt = `请估算以下食物的营养成分，返回 JSON 格式，包含 calories（千卡）、protein（克）、carbs（克）、fat（克）。
食物：${foodName}
分量：${quantity} ${unit}
要求：只返回 JSON，不要其他文字。`;

  const response = await axios.post(
    `${AI_BASE_URL}/chat/completions`,
    {
      model: AI_MODEL,
      messages: [
        { role: 'system', content: '你是营养学家，精通食物热量计算。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      timeout: 15000,
    }
  );

  const content = response.data.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const match = content.match(/\{.*\}/s);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('AI response parsing failed');
    }
  }

  return {
    calories: safeNumber(Number(parsed.calories)),
    protein: safeNumber(Number(parsed.protein)),
    carbs: safeNumber(Number(parsed.carbs)),
    fat: safeNumber(Number(parsed.fat)),
  };
}

// 模拟食物营养估算
function estimateWithMock(foodName: string, quantity: number, unit: string) {
  let key = foodName.trim();
  let factor = quantity / 100;
  if (unit === '个') {
    factor = quantity;
  } else if (unit === '份') {
    factor = quantity;
  }

  const base = mockNutrition[key];
  if (base) {
    return {
      calories: safeNumber(base.calories * factor),
      protein: safeNumber(base.protein * factor),
      carbs: safeNumber(base.carbs * factor),
      fat: safeNumber(base.fat * factor),
    };
  } else {
    return {
      calories: safeNumber(100 * factor),
      protein: safeNumber(5 * factor),
      carbs: safeNumber(10 * factor),
      fat: safeNumber(3 * factor),
    };
  }
}

// 对外统一入口：食物营养估算
export async function estimateFoodNutrition(foodName: string, quantity: number, unit: string) {
  try {
    if (AI_API_KEY) {
      console.log('使用 AI 估算食物营养...');
      return await estimateWithAI(foodName, quantity, unit);
    }
    throw new Error('No AI key, use mock');
  } catch (err) {
    console.warn('AI 估算失败，使用模拟数据:', (err as Error).message);
    return estimateWithMock(foodName, quantity, unit);
  }
}

// AI 估算动作 MET 值
export async function estimateMETWithAI(exerciseName: string, category: string) {
  if (!AI_API_KEY) {
    return category === 'strength' ? 5.0 : 7.0;
  }

  const prompt = `请估算以下健身动作的 MET 值（代谢当量），只返回一个数字。
动作名称：${exerciseName}
动作类型：${category === 'strength' ? '力量训练' : '有氧运动'}
要求：只返回数字，不要其他文字。`;

  try {
    const response = await axios.post(
      `${AI_BASE_URL}/chat/completions`,
      {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: '你是运动科学专家，精通各种运动的 MET 值。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        timeout: 15000,
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const metValue = parseFloat(content.replace(/[^\d.]/g, ''));
    return isFinite(metValue) ? metValue : (category === 'strength' ? 5.0 : 7.0);
  } catch (err) {
    console.warn('AI 估算 MET 失败，使用默认值:', (err as Error).message);
    return category === 'strength' ? 5.0 : 7.0;
  }
}