# 热点词云关键词提取逻辑说明

## 📊 提取流程

热点词云的关键词提取分为三个阶段：

### 1️⃣ 新闻标签提取（API端）

在 `/pages/api/news.ts` 中的 `extractKeywords()` 函数：

```typescript
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // 预定义的关键词模式匹配
  const patterns = [
    { regex: /股市|A股|上证|深证|创业板|科创板/g, tag: '股市' },
    { regex: /基金|公募|私募|ETF/g, tag: '基金' },
    { regex: /央行|货币政策|利率|降息|加息|流动性/g, tag: '货币政策' },
    { regex: /美联储|Fed|鲍威尔/g, tag: '美联储' },
    { regex: /新能源|电动车|电池|充电|锂电/g, tag: '新能源' },
    // ... 更多模式
  ];
  
  // 1. 先尝试匹配预定义模式
  for (const { regex, tag } of patterns) {
    if (regex.test(text) && keywords.length < 5) {
      keywords.push(tag);
    }
  }
  
  // 2. 如果没匹配到，提取高频中文词
  if (keywords.length === 0) {
    const words = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      // 过滤停用词
      if (!['这是', '但是', '因为', '所以'].includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // 取出现次数最多的3个词
    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    keywords.push(...sorted.map(([word]) => word));
  }
  
  return keywords.length > 0 ? keywords : ['热点'];
}
```

**提取策略：**
1. **优先匹配预定义模式**：使用正则表达式匹配财经领域的关键词
2. **降级到统计方法**：如果没有匹配到，则统计高频中文词汇
3. **兜底处理**：如果还是没有，返回默认标签"热点"

### 2️⃣ 热点统计（前端）

在 `/pages/index.tsx` 中的 `generateHotTopics()` 函数：

```typescript
const generateHotTopics = (news: NewsItem[]): HotTopicStats[] => {
  const topicCounts: Record<string, { count: number; category: string }> = {};
  
  // 遍历所有新闻，统计每个标签出现的次数
  news.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        if (!topicCounts[tag]) {
          topicCounts[tag] = { count: 0, category: item.category };
        }
        topicCounts[tag].count++;  // 累加计数
      });
    }
  });
  
  // 转换为数组并排序
  const topics = Object.entries(topicCounts)
    .map(([topic, data]) => ({
      topic,              // 关键词
      count: data.count,  // 出现次数
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
      category: data.category
    }))
    .sort((a, b) => b.count - a.count)  // 按次数降序
    .slice(0, 15);  // 取前15个
  
  return topics;
};
```

**统计逻辑：**
1. **遍历新闻**：遍历所有新闻的 `tags` 字段
2. **累加计数**：统计每个关键词出现的次数
3. **排序筛选**：按出现次数降序排序，取前15个
4. **趋势计算**：当前是随机生成（实际应用应基于历史数据对比）

### 3️⃣ 词云可视化

在前端渲染时：

```tsx
{hotTopics.map((topic) => {
  // 字体大小 = 基础大小 + (占比 * 最大增量)
  const fontSize = 12 + (topic.count / maxCount) * 28;
  
  // 透明度 = 基础透明度 + 占比
  const opacity = 0.5 + (topic.count / maxCount) * 0.5;
  
  // 颜色根据趋势
  const color = topic.trend === 'up' ? 'text-green-600' :
                topic.trend === 'down' ? 'text-red-600' :
                'text-primary-600';
  
  return (
    <button
      onClick={() => searchByTopic(topic.topic)}
      className={`font-semibold ${color}`}
      style={{ fontSize: `${fontSize}px`, opacity }}
    >
      {topic.topic}
    </button>
  );
})}
```

**视觉效果：**
- **字体大小**：出现次数越多，字体越大（12px - 40px）
- **透明度**：出现次数越多，颜色越深（0.5 - 1.0）
- **颜色**：上升趋势绿色，下降趋势红色，稳定蓝色

## 🎯 关键特点

### 优点
1. **准确性高**：优先使用预定义的财经关键词模式
2. **覆盖全面**：涵盖股市、基金、货币政策、新能源等主要领域
3. **可扩展**：易于添加新的关键词模式
4. **用户体验好**：词云可点击筛选，视觉效果直观

### 局限性
1. **趋势计算**：当前是随机生成，实际应基于历史数据对比
2. **停用词**：高频词提取的停用词列表需要持续完善
3. **语义理解**：基于模式匹配，无法理解深层语义

## 🔧 改进建议

### 1. 趋势计算改进
```typescript
// 基于历史数据对比
const trend = calculateTrend(currentCount, lastWeekCount);
// 如果当前 > 上周，趋势上升
// 如果当前 < 上周，趋势下降
// 否则稳定
```

### 2. 关键词权重
```typescript
// 不同位置的关键词赋予不同权重
const weight = {
  title: 2.0,    // 标题中的关键词权重更高
  summary: 1.0,  // 摘要中的关键词权重一般
  content: 0.5   // 正文中的关键词权重较低
};
```

### 3. 接入NLP服务
- 使用jieba分词提高中文分词准确性
- 使用TF-IDF算法提取关键词
- 使用TextRank算法提取重要关键词

## 📈 实际效果

基于当前逻辑：
- **关键词来源**：新闻标题 + 摘要
- **词云大小**：15个关键词
- **更新频率**：每次刷新新闻时重新计算
- **交互功能**：点击关键词筛选相关新闻

---

**总结**：热点词云采用"模式匹配优先 + 统计方法兜底"的双重策略，确保关键词提取既准确又全面。
