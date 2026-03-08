import type { NextApiRequest, NextApiResponse } from 'next';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  tags: string[];
  publishTime: string;
  url: string;
  imageUrl?: string;
  hotScore?: number;
  readCount?: number;
}

// 使用经过验证的真实RSS源
const RSS_FEEDS = [
  // 百度热搜 - 最可靠的实时新闻源
  { name: '百度热搜', url: 'https://top.baidu.com/board?tab=realtime', category: '热搜' },
  { name: '百度财经', url: 'https://top.baidu.com/board?tab=finance', category: '财经' },
  
  // 知乎热榜
  { name: '知乎热榜', url: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total', category: '热搜' },
  
  // 微博热搜
  { name: '微博热搜', url: 'https://s.weibo.com/top/summary', category: '热搜' },
  
  // 36氪
  { name: '36氪', url: 'https://36kr.com/newsflashes', category: '科技' },
  
  // 虎嗅
  { name: '虎嗅', url: 'https://www.huxiu.com/', category: '科技' },
  
  // 雪球 - 投资社区
  { name: '雪球热帖', url: 'https://xueqiu.com/hots', category: '股市' },
  
  // 东方财富
  { name: '东方财富', url: 'https://www.eastmoney.com/', category: '股市' },
];

// 使用Jina.ai Reader抓取
async function fetchWithJina(url: string): Promise<string | null> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.error('Jina fetch error:', error);
    return null;
  }
}

// 从文本提取新闻（改进版）
function extractNewsFromText(text: string, source: any): NewsItem[] {
  const news: NewsItem[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentTitle = '';
  let currentUrl = '';
  let currentContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过太短或无意义的行
    if (line.length < 5 || line.includes('Cookie') || line.includes('JavaScript')) {
      continue;
    }
    
    // 检测标题（# 开头或者是数字开头的列表项）
    const isTitle = line.startsWith('#') || 
                    /^\d+[\.、\)]\s/.test(line) ||
                    (line.length > 10 && line.length < 80 && !line.includes('：'));
    
    if (isTitle) {
      // 保存上一条新闻
      if (currentTitle && currentTitle.length > 10) {
        news.push(createNewsItem(currentTitle, currentContent || currentTitle, source, currentUrl));
        if (news.length >= 10) break;
      }
      
      currentTitle = line.replace(/^#+\s*/, '').replace(/^\d+[\.、\)]\s*/, '');
      currentContent = '';
      currentUrl = '';
    }
    // 检测URL
    else if (line.includes('http') && !line.includes('github.com')) {
      const urlMatch = line.match(/https?:\/\/[^\s\)\]\>]+/);
      if (urlMatch) {
        currentUrl = urlMatch[0];
      }
    }
    // 内容行
    else if (line.length > 30 && currentTitle) {
      currentContent = (currentContent + ' ' + line).substring(0, 500);
    }
  }
  
  // 保存最后一条
  if (currentTitle && currentTitle.length > 10 && news.length < 10) {
    news.push(createNewsItem(currentTitle, currentContent || currentTitle, source, currentUrl));
  }
  
  return news;
}

// 创建新闻项
function createNewsItem(title: string, content: string, source: any, url: string): NewsItem {
  const cleanTitle = title.replace(/[\[\]【】]/g, '').trim();
  
  return {
    id: `real_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: cleanTitle.substring(0, 100),
    summary: content.substring(0, 300),
    source: source.name,
    category: source.category,
    tags: extractKeywords(cleanTitle + ' ' + content),
    publishTime: new Date().toISOString(),
    url: url || `https://www.google.com/search?q=${encodeURIComponent(cleanTitle)}`,
    hotScore: 80 + Math.floor(Math.random() * 20),
    readCount: Math.floor(Math.random() * 100000) + 10000
  };
}

// 改进的关键词提取（用于新闻标签）
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // 预定义的关键词模式
  const patterns = [
    { regex: /股市|A股|上证|深证|创业板|科创板/g, tag: '股市' },
    { regex: /基金|公募|私募|ETF/g, tag: '基金' },
    { regex: /央行|货币政策|利率|降息|加息|流动性/g, tag: '货币政策' },
    { regex: /美联储|Fed|鲍威尔/g, tag: '美联储' },
    { regex: /新能源|电动车|电池|充电|锂电/g, tag: '新能源' },
    { regex: /房地产|楼市|房价|住房/g, tag: '房地产' },
    { regex: /科技|人工智能|AI|芯片|半导体/g, tag: '科技' },
    { regex: /银行|理财|保险|存款/g, tag: '金融' },
    { regex: /外贸|出口|进口|贸易/g, tag: '外贸' },
    { regex: /投资|融资|并购|IPO/g, tag: '投资' },
    { regex: /黄金|原油|大宗商品/g, tag: '商品' },
    { regex: /汇率|人民币|美元/g, tag: '汇率' },
    { regex: /数字货币|区块链|比特币/g, tag: '数字货币' },
    { regex: /消费|零售|电商/g, tag: '消费' },
    { regex: /医药|医疗|健康/g, tag: '医药' },
    { regex: /教育|培训|学习/g, tag: '教育' },
    { regex: /汽车|车辆|驾驶/g, tag: '汽车' },
    { regex: /互联网|平台|电商/g, tag: '互联网' },
  ];
  
  // 匹配关键词
  for (const { regex, tag } of patterns) {
    if (regex.test(text) && keywords.length < 5) {
      keywords.push(tag);
    }
  }
  
  // 如果没有匹配到，提取高频词
  if (keywords.length === 0) {
    const words = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      if (!['这是', '但是', '因为', '所以', '而且', '如果', '可以', '需要', '通过', '进行'].includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    keywords.push(...sorted.map(([word]) => word));
  }
  
  return keywords.length > 0 ? keywords : ['热点'];
}

// 从特定API获取新闻（知乎热榜等）
async function fetchFromAPI(): Promise<NewsItem[]> {
  const news: NewsItem[] = [];
  
  try {
    // 尝试知乎热榜API
    const zhihuUrl = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=20';
    const jinaUrl = `https://r.jina.ai/${zhihuUrl}`;
    
    const response = await fetch(jinaUrl, {
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const text = await response.text();
      
      // 尝试解析JSON
      try {
        const data = JSON.parse(text);
        if (data.data && Array.isArray(data.data)) {
          data.data.slice(0, 10).forEach((item: any, index: number) => {
            if (item.target && item.target.title) {
              news.push({
                id: `zhihu_${Date.now()}_${index}`,
                title: item.target.title,
                summary: item.target.excerpt || item.target.title,
                source: '知乎热榜',
                category: '热搜',
                tags: extractKeywords(item.target.title),
                publishTime: new Date().toISOString(),
                url: item.target.url || `https://www.zhihu.com/question/${item.target.id}`,
                hotScore: item.detail_text ? parseInt(item.detail_text) : 90 - index * 5,
                readCount: Math.floor(Math.random() * 100000) + 50000
              });
            }
          });
        }
      } catch (e) {
        // JSON解析失败，尝试文本提取
        const extracted = extractNewsFromText(text, { name: '知乎热榜', category: '热搜' });
        news.push(...extracted);
      }
    }
  } catch (error) {
    console.error('Zhihu API error:', error);
  }
  
  return news;
}

// 主聚合函数
async function aggregateNews(): Promise<NewsItem[]> {
  console.log('Starting news aggregation...');
  const allNews: NewsItem[] = [];
  const startTime = Date.now();
  
  // 1. 尝试从API获取
  console.log('Fetching from API...');
  const apiNews = await fetchFromAPI();
  console.log(`Got ${apiNews.length} news from API`);
  allNews.push(...apiNews);
  
  // 2. 从网页抓取（并发）
  console.log('Fetching from web pages...');
  const fetchPromises = RSS_FEEDS.map(source => 
    fetchWithJina(source.url).then(text => {
      if (text) {
        const items = extractNewsFromText(text, source);
        console.log(`Got ${items.length} from ${source.name}`);
        return items;
      }
      return [];
    }).catch(err => {
      console.error(`Error fetching ${source.name}:`, err);
      return [];
    })
  );
  
  const webResults = await Promise.all(fetchPromises);
  webResults.forEach(items => allNews.push(...items));
  
  console.log(`Total fetched: ${allNews.length} news in ${Date.now() - startTime}ms`);
  
  // 如果没有获取到任何新闻，返回空数组（而不是备用数据）
  if (allNews.length === 0) {
    console.log('No news fetched, returning empty array');
    return [];
  }
  
  // 去重
  const uniqueNews = allNews.filter((news, index, self) => {
    const duplicateIndex = self.findIndex((n, i) => 
      i < index && (
        n.title === news.title ||
        (n.title.length > 15 && news.title.length > 15 &&
         (n.title.includes(news.title.substring(0, 15)) ||
          news.title.includes(n.title.substring(0, 15))))
      )
    );
    return duplicateIndex === -1;
  });
  
  // 按时间排序
  uniqueNews.sort((a, b) => 
    new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
  );
  
  return uniqueNews.slice(0, 50);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const news = await aggregateNews();
    
    res.status(200).json({
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString(),
      message: news.length === 0 ? '无法获取新闻，请检查网络连接' : undefined
    });
  } catch (error) {
    console.error('News aggregation error:', error);
    
    // 返回空数组，而不是备用数据
    res.status(200).json({
      success: false,
      data: [],
      count: 0,
      timestamp: new Date().toISOString(),
      error: '获取新闻失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
