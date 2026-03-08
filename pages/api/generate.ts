import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerateRequest {
  newsTitle: string;
  newsSummary: string;
  newsCategory: string;
  materialType: 'video' | 'article' | 'livestream' | 'social';
  aiProvider?: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
}

// OpenAI API 调用
async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的金融投顾内容创作专家，擅长为投资顾问创作吸引人的短视频脚本、图文内容、直播话术和社交媒体文案。内容要专业、准确、合规，同时通俗易懂。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Anthropic API 调用
async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `你是一位专业的金融投顾内容创作专家，擅长为投资顾问创作吸引人的短视频脚本、图文内容、直播话术和社交媒体文案。内容要专业、准确、合规，同时通俗易懂。\n\n${prompt}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// 本地模拟（使用模板）
function generateWithTemplate(
  newsTitle: string,
  newsSummary: string,
  materialType: string
): { title: string; content: string; script?: string } {
  const templates = {
    video: {
      title: `【投资热点】${newsTitle.substring(0, 20)}...这3点必须知道！`,
      content: `视频主题：${newsTitle}\n\n核心观点：\n${newsSummary}\n\n本视频为您深度解读这一财经热点对投资的影响。`,
      script: `【视频脚本】

📱 开场（3秒）
大家好，我是您的专属投顾，今天我们来聊聊一个热门话题。

🔥 引入（5秒）
${newsTitle}

💡 核心内容（20秒）
${newsSummary}

💰 投资建议（10秒）
针对这个热点，我建议投资者：
1. 保持理性，不要盲目跟风
2. 关注相关板块的龙头企业
3. 做好风险控制，合理配置资产

👋 结尾（5秒）
想了解更多投资机会，欢迎关注我，我们下期见！

【拍摄建议】
- 背景：简约专业背景
- 着装：正装
- 语速：中等偏快
- 时长：约45秒
- 字幕：全程配字幕`
    },
    article: {
      title: `深度解读｜${newsTitle}`,
      content: `# ${newsTitle}

## 📰 事件概述

${newsSummary}

## 📊 市场影响分析

本次事件对金融市场产生重要影响，具体表现在：

### 短期影响
- 市场情绪有所波动，相关板块出现异动
- 投资者需密切关注后续政策动向

### 中期影响
- 政策导向逐渐明朗，行业格局可能重塑
- 相关产业链企业将受益或承压

### 长期影响
- 符合经济发展趋势，具备长期投资价值
- 建议关注行业龙头和优质标的

## 💡 投资策略建议

### 保守型投资者
- 建议观望为主，等待市场进一步明朗
- 可适当配置相关ETF基金，分散风险

### 稳健型投资者
- 关注行业龙头企业，逢低布局
- 控制仓位在总资产的10-20%以内

### 积极型投资者
- 可适度参与热点投资
- 设置止盈止损，严格执行交易纪律

## ⚠️ 风险提示

1. 市场有风险，投资需谨慎
2. 以上观点仅供参考，不构成投资建议
3. 请根据自身风险承受能力做出投资决策

---
*本文由AI智能生成，仅供参考学习*
*发布时间：${new Date().toLocaleDateString('zh-CN')}*`
    },
    livestream: {
      title: `直播预告：${newsTitle}深度解读`,
      content: `直播主题：${newsTitle}\n\n预计时长：30-45分钟\n\n直播将深度解析这一财经热点，并回答观众提问。`,
      script: `【直播话术】

📌 直播主题：${newsTitle}

🕐 预计时长：30-45分钟

## 🎬 开场（2分钟）

各位观众朋友们，大家好！欢迎来到今天的投资直播间。我是你们的专属投顾。

今天我们要聊的话题非常热门，相信大家都看到了这条新闻：**${newsTitle}**

## 📝 内容大纲（20-30分钟）

### 第一部分：事件解读（8分钟）
- 新闻背景介绍
- 核心要点分析
- 对市场的影响

### 第二部分：投资机会（10分钟）
- 相关板块分析
- 潜在投资标的
- 操作建议分享

### 第三部分：互动答疑（10分钟）
- 观众提问环节
- 热点问题解答
- 个性化建议

### 第四部分：风险提示（5分钟）
- 投资风险告知
- 注意事项提醒

## 👋 结尾（2分钟）

感谢大家今天的观看和互动！如果觉得内容有帮助，记得点赞关注哦！

---

【互动话术】
- "大家在评论区说说，你们对这个消息怎么看？"
- "如果觉得有收获的，扣个1让我看到！"
- "有问题的朋友，现在可以在评论区提问了"

【注意事项】
- 保持专业度和亲和力
- 及时回应观众评论
- 控制直播节奏
- 注意合规要求，不承诺收益`
    },
    social: {
      title: `⚡${newsTitle.substring(0, 25)}...`,
      content: `⚡【财经快讯】

${newsTitle}

📝 ${newsSummary}

📊 来源：权威财经媒体
⏰ 时间：${new Date().toLocaleString('zh-CN')}

#投资理财 #财经热点 #${newsTitle.includes('股') ? '股市' : '金融'} #投资机会

━━━━━━━━━━
💬 投资有风险，入市需谨慎
💡 关注我，每天获取最新财经资讯`
    }
  };

  return templates[materialType as keyof typeof templates] || templates.article;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      newsTitle, 
      newsSummary, 
      newsCategory, 
      materialType,
      aiProvider = 'local',
      apiKey 
    } = req.body as GenerateRequest;

    if (!newsTitle || !materialType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['newsTitle', 'materialType']
      });
    }

    let content: string;
    let title: string;
    let script: string | undefined;

    // 构建提示词
    const promptMap = {
      video: `请为以下财经新闻创作一个短视频脚本（约45秒）：

新闻标题：${newsTitle}
新闻内容：${newsSummary}
分类：${newsCategory}

要求：
1. 开场要吸引眼球
2. 内容通俗易懂，适合普通投资者
3. 包含投资建议（风险提示）
4. 结尾引导关注

请按以下格式输出：
标题：xxx
内容：xxx
脚本：xxx（包含开场、引入、核心内容、投资建议、结尾，以及拍摄建议）`,

      article: `请为以下财经新闻创作一篇深度解读文章：

新闻标题：${newsTitle}
新闻内容：${newsSummary}
分类：${newsCategory}

要求：
1. 标题吸引眼球
2. 结构清晰，包含：事件概述、市场影响、投资策略、风险提示
3. 针对不同风险偏好的投资者给出建议
4. 专业但易懂，合规严谨

请按以下格式输出：
标题：xxx
内容：xxx（使用Markdown格式）`,

      livestream: `请为以下财经新闻创作一个直播话术：

新闻标题：${newsTitle}
新闻内容：${newsSummary}
分类：${newsCategory}

要求：
1. 开场要有吸引力
2. 内容分为4部分：事件解读、投资机会、互动答疑、风险提示
3. 包含互动话术
4. 总时长30-45分钟

请按以下格式输出：
标题：xxx
内容：xxx
脚本：xxx（完整的直播流程和话术）`,

      social: `请为以下财经新闻创作一条社交媒体文案：

新闻标题：${newsTitle}
新闻内容：${newsSummary}
分类：${newsCategory}

要求：
1. 简洁有力，适合微信、微博等平台
2. 包含表情符号增加可读性
3. 添加相关标签
4. 引导关注

请按以下格式输出：
标题：xxx
内容：xxx`
    };

    const prompt = promptMap[materialType as keyof typeof promptMap];

    // 根据 AI 提供商调用不同的 API
    if (aiProvider === 'openai' && apiKey) {
      content = await callOpenAI(prompt, apiKey);
      // 解析 AI 返回的内容
      const titleMatch = content.match(/标题：(.+)/);
      const contentMatch = content.match(/内容：([\s\S]+?)(?=脚本：|$)/);
      const scriptMatch = content.match(/脚本：([\s\S]+)/);
      
      title = titleMatch ? titleMatch[1].trim() : newsTitle;
      content = contentMatch ? contentMatch[1].trim() : content;
      script = scriptMatch ? scriptMatch[1].trim() : undefined;
    } else if (aiProvider === 'anthropic' && apiKey) {
      content = await callAnthropic(prompt, apiKey);
      // 解析 AI 返回的内容
      const titleMatch = content.match(/标题：(.+)/);
      const contentMatch = content.match(/内容：([\s\S]+?)(?=脚本：|$)/);
      const scriptMatch = content.match(/脚本：([\s\S]+)/);
      
      title = titleMatch ? titleMatch[1].trim() : newsTitle;
      content = contentMatch ? contentMatch[1].trim() : content;
      script = scriptMatch ? scriptMatch[1].trim() : undefined;
    } else {
      // 使用本地模板
      const result = generateWithTemplate(newsTitle, newsSummary, materialType);
      title = result.title;
      content = result.content;
      script = result.script;
    }

    res.status(200).json({
      success: true,
      data: {
        title,
        content,
        script,
        type: materialType,
        generatedAt: new Date().toISOString(),
        provider: aiProvider
      }
    });

  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
