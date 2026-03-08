import type { NextApiRequest, NextApiResponse } from 'next';
import { NewsItem } from '../../types';

// 财经关键词
const FINANCE_KEYWORDS = [
  '股市', 'A股', '上证指数', '深证成指', '创业板', '科创板', '港股', '美股',
  '基金', 'ETF', '公募', '私募', '理财', '资管',
  '央行', '货币政策', '利率', '降息', '加息', 'LPR', 'MLF',
  'GDP', '经济', '通胀', 'CPI', 'PPI', 'PMI',
  '新能源', '电动车', '电池', '光伏', '风电',
  '科技', '人工智能', 'AI', '芯片', '半导体',
  '消费', '零售', '电商', '白酒',
  '医药', '医疗', '创新药', '生物',
  '地产', '房地产', '楼市', '房价',
  '银行', '保险', '证券', '券商',
  '债券', '国债', '期货', '黄金', '原油'
];

// 分类映射
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '宏观经济': ['央行', '货币政策', '利率', 'GDP', 'CPI', 'PPI', '经济', '财政', '发改委', '国务院'],
  '股市行情': ['股市', 'A股', '上证', '深证', '创业板', '科创板', '股价', '涨停', '跌停', '北向资金'],
  '基金理财': ['基金', 'ETF', '公募', '私募', '理财', '资管', '净值'],
  '新能源': ['新能源', '电动车', '电池', '光伏', '风电', '储能', '锂电', '新能源汽车'],
  '科技创新': ['科技', '人工智能', 'AI', '芯片', '半导体', '互联网', '数字经济'],
  '消费零售': ['消费', '零售', '电商', '白酒', '食品', '餐饮', '旅游'],
  '医药医疗': ['医药', '医疗', '创新药', '生物', '疫苗', '医疗器械'],
  '房地产': ['地产', '房地产', '楼市', '房价', '房企', '保障房'],
  '银行保险': ['银行', '保险', '券商', '证券', '信托', '金融']
};

// 从文本提取关键词
function extractKeywords(title: string, summary?: string): string[] {
  const text = `${title} ${summary || ''}`;
  const keywords: string[] = [];
  
  for (const keyword of FINANCE_KEYWORDS) {
    if (text.includes(keyword) && keywords.length < 5) {
      keywords.push(keyword);
    }
  }
  
  return keywords.length > 0 ? keywords : ['财经'];
}

// 推断分类
function inferCategory(title: string, summary?: string): string {
  const text = `${title} ${summary || ''}`;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  return '财经要闻';
}

// 计算热度
function calculateHotScore(publishTime: string): number {
  const hoursSincePublish = (Date.now() - new Date(publishTime).getTime()) / (1000 * 60 * 60);
  const recencyBonus = Math.max(0, 24 - hoursSincePublish) * 2;
  const randomBonus = Math.floor(Math.random() * 15);
  return Math.min(100, 75 + recencyBonus + randomBonus);
}

// 趋势
function inferTrend(): 'up' | 'down' | 'stable' {
  const random = Math.random();
  if (random > 0.6) return 'up';
  if (random > 0.3) return 'stable';
  return 'down';
}

// 使用Jina.ai Reader抓取
async function fetchWithJina(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(20000)
    });
    return response.ok ? await response.text() : '';
  } catch {
    return '';
  }
}

// 从RSSHub获取RSS（这是一个开源的RSS生成器，支持很多网站）
async function fetchFromRSSHub(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  // RSSHub公共实例
  const feeds = [
    { url: 'https://rsshub.app/finance/sina', source: '新浪财经' },
    { url: 'https://rsshub.app/finance/eastmoney/report', source: '东方财富研报' },
    { url: 'https://rsshub.app/cls/telegraph', source: '财联社' },
    { url: 'https://rsshub.app/36kr/newsflashes', source: '36氪' },
  ];
  
  for (const feed of feeds) {
    try {
      const xml = await fetchWithJina(feed.url);
      if (!xml) continue;
      
      // 解析RSS
      const items = xml.split('<item>');
      for (let i = 1; i < items.length && i <= 5; i++) {
        const item = items[i];
        
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : '';
        
        if (!title || title.length < 10) continue;
        
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const link = linkMatch ? linkMatch[1].trim() : '';
        
        const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/);
        const description = descMatch ? (descMatch[1] || descMatch[2]).replace(/<[^>]+>/g, '').trim().substring(0, 200) : '';
        
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
        
        // 必须包含财经关键词
        if (!FINANCE_KEYWORDS.some(kw => title.includes(kw) || description.includes(kw))) {
          continue;
        }
        
        newsItems.push({
          id: `rsshub-${Date.now()}-${newsItems.length}`,
          title,
          summary: description,
          source: feed.source,
          publishTime: pubDate,
          category: inferCategory(title, description),
          tags: extractKeywords(title, description),
          hotScore: calculateHotScore(pubDate),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: link,
          trend: inferTrend()
        });
      }
    } catch (e) {
      console.error(`RSSHub fetch error for ${feed.source}:`, e);
    }
  }
  
  return newsItems;
}

// 从公开的新闻API获取（使用免费的API）
async function fetchFromPublicAPI(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  try {
    // 使用NewsAPI的免费沙盒（不需要key，但有限制）
    // 或者使用其他公开的新闻源
    
    // 尝试Currents API（如果有免费的公共端点）
    // 这里我们主要依赖RSSHub
    
  } catch (e) {
    console.error('Public API fetch error:', e);
  }
  
  return newsItems;
}

// 从财经网站抓取（改进版 - 使用专门的新闻列表API）
async function fetchFromFinancialAPIs(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  try {
    // 使用新浪财经的JSON API
    const sinaUrl = 'https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&k=&num=20&page=1&r=0.123456';
    const jinaUrl = `https://r.jina.ai/${sinaUrl}`;
    
    const response = await fetch(jinaUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (response.ok) {
      const text = await response.text();
      
      // 尝试解析JSON（Jina会返回文本格式）
      try {
        // Jina会转换JSON为Markdown格式，我们需要解析它
        const lines = text.split('\n');
        let count = 0;
        
        for (const line of lines) {
          // 查找标题和URL
          if (line.includes('"title"') && line.includes('"url"')) {
            const titleMatch = line.match(/"title"\s*:\s*"([^"]+)"/);
            const urlMatch = line.match(/"url"\s*:\s*"([^"]+)"/);
            
            if (titleMatch && urlMatch && count < 10) {
              const title = titleMatch[1];
              const url = urlMatch[1];
              
              if (title.length > 10 && FINANCE_KEYWORDS.some(kw => title.includes(kw))) {
                newsItems.push({
                  id: `sina-json-${Date.now()}-${count}`,
                  title,
                  summary: '',
                  source: '新浪财经',
                  publishTime: new Date().toISOString(),
                  category: inferCategory(title),
                  tags: extractKeywords(title),
                  hotScore: calculateHotScore(new Date().toISOString()),
                  readCount: Math.floor(Math.random() * 50000) + 10000,
                  url,
                  trend: inferTrend()
                });
                count++;
              }
            }
          }
        }
      } catch (e) {
        console.error('Sina JSON parse error:', e);
      }
    }
  } catch (e) {
    console.error('Financial API fetch error:', e);
  }
  
  return newsItems;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const { category, search, tag } = req.query;
    
    console.log(`[News API ${new Date().toISOString()}] 开始获取新闻...`);
    
    // 并发获取
    const [rsshubNews, apiNews] = await Promise.all([
      fetchFromRSSHub(),
      fetchFromFinancialAPIs()
    ]);
    
    // 合并
    let newsItems = [...rsshubNews, ...apiNews];
    
    console.log(`[News API] 获取到 ${newsItems.length} 条新闻`);
    
    // 去重
    const uniqueNews: NewsItem[] = [];
    const seenTitles = new Set<string>();
    
    for (const news of newsItems) {
      const normalizedTitle = news.title.replace(/\s+/g, '').substring(0, 20);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueNews.push(news);
      }
    }
    
    // 如果没有新闻
    if (uniqueNews.length === 0) {
      return res.status(200).json({
        success: false,
        data: [],
        total: 0,
        message: '暂时无法获取新闻。可能的原因：1) RSSHub服务暂时不可用 2) 网络问题。请稍后重试。',
        timestamp: new Date().toISOString(),
        version: 'v2.0-rsshub'
      });
    }
    
    // 筛选
    let filteredNews = [...uniqueNews];
    
    if (category && category !== '全部') {
      filteredNews = filteredNews.filter(item => item.category === category);
    }
    
    if (tag) {
      filteredNews = filteredNews.filter(item => item.tags.includes(tag as string));
    }
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredNews = filteredNews.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower)
      );
    }
    
    // 排序
    filteredNews.sort((a, b) => b.hotScore - a.hotScore);
    
    // 返回
    res.status(200).json({
      success: true,
      data: filteredNews,
      total: filteredNews.length,
      sources: [...new Set(filteredNews.map(n => n.source))],
      timestamp: new Date().toISOString(),
      version: 'v2.0-rsshub'
    });
    
  } catch (error) {
    console.error('[News API] Error:', error);
    
    res.status(500).json({
      success: false,
      error: '获取新闻失败',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
