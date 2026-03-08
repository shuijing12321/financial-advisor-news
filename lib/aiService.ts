import { NewsItem, Material, MaterialType } from '@/types';

// AI 素材生成服务
// 这里使用模拟的 AI 生成逻辑，实际项目中可以接入 GPT、Claude 等 AI API

// 模拟 AI 生成延迟
const simulateDelay = (ms: number = 1500) => new Promise(resolve => setTimeout(resolve, ms));

// 生成素材标题
function generateTitle(news: NewsItem, type: MaterialType): string {
  const templates = {
    video: [
      `【投资热点】${news.title}，这3点你必须知道！`,
      `🔥${news.category}快讯：${news.title.substring(0, 15)}...`,
      `理财必修课：${news.title}，普通人如何把握机会？`,
    ],
    article: [
      `深度解读｜${news.title}`,
      `${news.category}分析：${news.title}`,
      `投资策略：如何应对${news.title}?`,
    ],
    livestream: [
      `直播预告：${news.title}深度解读`,
      `在线答疑：${news.title}对您的投资有何影响？`,
      `投资沙龙：聊聊${news.category}新动向`,
    ],
    social: [
      `📊${news.title}\n\n#投资理财 #${news.category}`,
      `【快讯】${news.title}\n\n来源：${news.source}\n#财经热点`,
      `⚡${news.category}最新：${news.title.substring(0, 20)}...`,
    ]
  };
  
  const templateList = templates[type];
  return templateList[Math.floor(Math.random() * templateList.length)];
}

// 生成短视频脚本
function generateVideoScript(news: NewsItem): string {
  return `【视频脚本】

开场（3秒）：
大家好，我是您的专属投顾，今天我们来聊聊一个热门话题。

引入（5秒）：
${news.title}

核心内容（20秒）：
${news.summary}

投资建议（10秒）：
针对这个热点，我建议投资者：
1. 保持理性，不要盲目跟风
2. 关注相关板块的龙头企业
3. 做好风险控制，合理配置资产

结尾（5秒）：
想了解更多投资机会，欢迎关注我，我们下期见！

【拍摄建议】
- 背景：简约专业背景
- 着装：正装
- 语速：中等偏快
- 时长：约45秒
- 字幕：全程配字幕`;
}

// 生成图文内容
function generateArticleContent(news: NewsItem): string {
  return `# ${news.title}

## 事件概述

${news.summary}

## 市场影响

本次事件对${news.category}领域产生重要影响，具体表现在：

1. **短期影响**：市场情绪有所波动，相关板块出现异动
2. **中期影响**：政策导向逐渐明朗，行业格局可能重塑
3. **长期影响**：符合经济发展趋势，具备长期投资价值

## 投资策略

针对不同风险偏好的投资者，我们建议：

### 保守型投资者
- 建议观望为主，等待市场进一步明朗
- 可适当配置相关ETF基金，分散风险

### 稳健型投资者
- 关注行业龙头企业，逢低布局
- 控制仓位在总资产的10-20%以内

### 积极型投资者
- 可适度参与热点投资
- 设置止盈止损，严格执行交易纪律

## 风险提示

1. 市场有风险，投资需谨慎
2. 以上观点仅供参考，不构成投资建议
3. 请根据自身风险承受能力做出投资决策

---
*本文由AI智能生成，仅供参考学习*
*发布时间：${new Date().toLocaleDateString('zh-CN')}*`;
}

// 生成直播话术
function generateLivestreamScript(news: NewsItem): string {
  return `【直播话术】

📌 直播主题：${news.title}

🕐 预计时长：30-45分钟

## 开场（2分钟）

各位观众朋友们，大家好！欢迎来到今天的投资直播间。我是你们的专属投顾[名字]。

今天我们要聊的话题非常热门，相信大家都看到了这条新闻：${news.title}

## 内容大纲（20-30分钟）

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

## 结尾（2分钟）

感谢大家今天的观看和互动！如果觉得内容有帮助，记得点赞关注哦！

我们下次直播时间是[时间]，主题是[预告]，不见不散！

---

【互动话术】
- "大家在评论区说说，你们对这个消息怎么看？"
- "如果觉得有收获的，扣个1让我看到！"
- "有问题的朋友，现在可以在评论区提问了"
- "感谢[观众名]送的礼物，非常感谢支持！"

【注意事项】
- 保持专业度和亲和力
- 及时回应观众评论
- 控制直播节奏
- 注意合规要求，不承诺收益`;
}

// 生成社交媒体文案
function generateSocialContent(news: NewsItem): string {
  const hashtags = news.tags.map(tag => `#${tag}`).join(' ');
  
  return `⚡【财经快讯】

${news.title}

📝 ${news.summary}

📊 来源：${news.source}
⏰ 时间：${new Date(news.publishTime).toLocaleString('zh-CN')}

${hashtags}

━━━━━━━━━━
💬 投资有风险，入市需谨慎
💡 关注我，每天获取最新财经资讯`;
}

// 主生成函数
export async function generateMaterial(
  news: NewsItem,
  type: MaterialType
): Promise<Partial<Material>> {
  await simulateDelay(1500);
  
  const title = generateTitle(news, type);
  let content = '';
  let script = '';
  
  switch (type) {
    case 'video':
      content = `视频主题：${news.title}\n\n核心观点：\n${news.summary}`;
      script = generateVideoScript(news);
      break;
    case 'article':
      content = generateArticleContent(news);
      break;
    case 'livestream':
      content = `直播主题：${news.title}`;
      script = generateLivestreamScript(news);
      break;
    case 'social':
      content = generateSocialContent(news);
      break;
  }
  
  return {
    newsId: news.id,
    type,
    title,
    content,
    script,
    tags: news.tags,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// 优化建议
export async function getOptimizationSuggestions(
  content: string,
  type: MaterialType
): Promise<string[]> {
  await simulateDelay(800);
  
  const suggestions = [
    '建议在开头增加吸引眼球的数据或案例',
    '可以添加相关图表，提升内容可视化程度',
    '适当增加互动元素，提高用户参与度',
    '标题可以更加具体，包含数字或时间限定',
    '建议增加风险提示部分，符合合规要求',
    '可以添加相关案例或数据支撑观点',
    '适当使用表情符号，增加亲和力（社交媒体适用）'
  ];
  
  return suggestions.slice(0, Math.floor(Math.random() * 4) + 2);
}

// 批量生成所有类型素材
export async function generateAllMaterials(news: NewsItem): Promise<{
  video: Partial<Material>;
  article: Partial<Material>;
  livestream: Partial<Material>;
  social: Partial<Material>;
}> {
  await simulateDelay(3000);
  
  const [video, article, livestream, social] = await Promise.all([
    generateMaterial(news, 'video'),
    generateMaterial(news, 'article'),
    generateMaterial(news, 'livestream'),
    generateMaterial(news, 'social')
  ]);
  
  return { video, article, livestream, social };
}
