import type { NextApiRequest, NextApiResponse } from 'next';
import { NewsItem } from '../../types';

// 真实新闻API配置
const NEWS_APIS = {
  // GNews API - 每天免费100个请求
  gnews: {
    url: 'https://gnews.io/api/v4/top-headlines',
    params: {
      token: process.env.GNEWS_API_KEY || '', // 需要配置
      lang: 'zh',
      country: 'cn',
      topic: 'business',
      max: 20
    }
  },
  // NewsAPI - 每天免费100个请求
  newsapi: {
    url: 'https://newsapi.org/v2/top-headlines',
    params: {
      apiKey: process.env.NEWS_API_KEY || '', // 需要配置
      country: 'cn',
      category: 'business',
      pageSize: 20
    }
  },
  // Currents API - 每天免费200个请求
  currents: {
    url: 'https://api.currentsapi.services/v1/latest-news',
    params: {
      apiKey: process.env.CURRENTS_API_KEY || '', // 需要配置
      language: 'zh',
      category: 'business'
    }
  },
  // NewsData.io - 每天免费200个请求
  newsdata: {
    url: 'https://newsdata.io/api/1/news',
    params: {
      apikey: process.env.NEWSDATA_API_KEY || '', // 需要配置
      category: 'business',
      country: 'cn',
      language: 'zh'
    }
  }
};

// RSS源配置 - 需要解析RSS
const RSS_FEEDS = [
  {
    name: '新华网财经',
    url: 'http://www.news.cn/fortune/news_finance.xml',
    category: '财经要闻'
  },
  {
    name: '人民网财经',
    url: 'http://finance.people.com.cn/rss/finance.xml',
    category: '财经要闻'
  },
  {
    name: '中国证券报',
    url: 'http://www.cs.com.cn/rss/cs.xml',
    category: '证券市场'
  },
  {
    name: '上海证券报',
    url: 'http://www.cnstock.com/rss/news.xml',
    category: '证券市场'
  }
];

// 财经关键词
const FINANCE_KEYWORDS = [
  '股市', 'A股', '上证指数', '深证成指', '创业板', '科创板', '港股', '美股',
  '基金', 'ETF', '公募', '私募', '理财', '资管',
  '央行', '货币政策', '利率', '降息', '加息', 'LPR', 'MLF', '存款准备金',
  'GDP', '经济', '通胀', 'CPI', 'PPI', 'PMI',
  '新能源', '电动车', '电池', '光伏', '风电', '储能',
  '科技', '人工智能', 'AI', '芯片', '半导体', '集成电路',
  '消费', '零售', '电商', '白酒', '食品饮料',
  '医药', '医疗', '创新药', '生物科技', '医疗器械',
  '地产', '房地产', '楼市', '房价', '保障房',
  '银行', '保险', '证券', '券商', '信托',
  '债券', '国债', '信用债', '可转债',
  '黄金', '原油', '大宗商品', '期货',
  'IPO', '上市公司', '财报', '业绩', '并购', '重组'
];

// 分类映射
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '宏观经济': ['央行', '货币政策', '利率', 'GDP', 'CPI', 'PPI', '经济', '财政', '发改委'],
  '股市行情': ['股市', 'A股', '上证', '深证', '创业板', '科创板', '股价', '涨停', '跌停'],
  '基金理财': ['基金', 'ETF', '公募', '私募', '理财', '资管', '净值'],
  '债券市场': ['债券', '国债', '信用债', '可转债', '收益率'],
  '期货大宗': ['期货', '黄金', '原油', '大宗商品', '铜', '铝'],
  '外汇市场': ['汇率', '人民币', '美元', '欧元', '外汇'],
  '新能源': ['新能源', '电动车', '电池', '光伏', '风电', '储能', '锂电'],
  '科技创新': ['科技', '人工智能', 'AI', '芯片', '半导体', '互联网', '数字经济'],
  '消费零售': ['消费', '零售', '电商', '白酒', '食品', '餐饮', '旅游'],
  '医药医疗': ['医药', '医疗', '创新药', '生物', '疫苗', '医疗器械'],
  '房地产': ['地产', '房地产', '楼市', '房价', '房企', '保障房'],
  '银行保险': ['银行', '保险', '券商', '证券', '信托', '金融']
};

// 从文本中提取关键词
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

// 从标题和内容推断分类
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

// 计算热度分数
function calculateHotScore(publishTime: string, readCount?: number): number {
  const hoursSincePublish = (Date.now() - new Date(publishTime).getTime()) / (1000 * 60 * 60);
  const recencyBonus = Math.max(0, 24 - hoursSincePublish) * 2;
  const randomBonus = Math.floor(Math.random() * 15);
  const baseScore = 75;
  
  return Math.min(100, baseScore + recencyBonus + randomBonus);
}

// 趋势判断
function inferTrend(): 'up' | 'down' | 'stable' {
  const random = Math.random();
  if (random > 0.6) return 'up';
  if (random > 0.3) return 'stable';
  return 'down';
}

// 从GNews获取新闻
async function fetchFromGNews(): Promise<NewsItem[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.log('GNEWS_API_KEY not configured');
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      token: apiKey,
      lang: 'zh',
      country: 'cn',
      topic: 'business',
      max: '20'
    });
    
    const response = await fetch(`https://gnews.io/api/v4/top-headlines?${params}`);
    
    if (!response.ok) {
      console.log('GNews API failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return [];
    }
    
    return data.articles.map((article: any, index: number) => ({
      id: `gnews-${Date.now()}-${index}`,
      title: article.title || '',
      summary: article.description || '',
      source: article.source?.name || 'GNews',
      publishTime: article.publishedAt || new Date().toISOString(),
      category: inferCategory(article.title, article.description),
      tags: extractKeywords(article.title, article.description),
      hotScore: calculateHotScore(article.publishedAt || new Date().toISOString()),
      readCount: Math.floor(Math.random() * 50000) + 5000,
      url: article.url || '',
      trend: inferTrend()
    }));
  } catch (error) {
    console.error('GNews fetch error:', error);
    return [];
  }
}

// 从NewsAPI获取新闻
async function fetchFromNewsAPI(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log('NEWS_API_KEY not configured');
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      apiKey: apiKey,
      country: 'cn',
      category: 'business',
      pageSize: '20'
    });
    
    const response = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
    
    if (!response.ok) {
      console.log('NewsAPI failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return [];
    }
    
    return data.articles.map((article: any, index: number) => ({
      id: `newsapi-${Date.now()}-${index}`,
      title: article.title || '',
      summary: article.description || '',
      source: article.source?.name || 'NewsAPI',
      publishTime: article.publishedAt || new Date().toISOString(),
      category: inferCategory(article.title, article.description),
      tags: extractKeywords(article.title, article.description),
      hotScore: calculateHotScore(article.publishedAt || new Date().toISOString()),
      readCount: Math.floor(Math.random() * 50000) + 5000,
      url: article.url || '',
      trend: inferTrend()
    }));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

// 从Currents API获取新闻
async function fetchFromCurrents(): Promise<NewsItem[]> {
  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) {
    console.log('CURRENTS_API_KEY not configured');
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      apiKey: apiKey,
      language: 'zh',
      category: 'business'
    });
    
    const response = await fetch(`https://api.currentsapi.services/v1/latest-news?${params}`);
    
    if (!response.ok) {
      console.log('Currents API failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.news || data.news.length === 0) {
      return [];
    }
    
    return data.news.map((article: any, index: number) => ({
      id: `currents-${Date.now()}-${index}`,
      title: article.title || '',
      summary: article.description || '',
      source: article.author || article.source || 'Currents',
      publishTime: article.published || new Date().toISOString(),
      category: inferCategory(article.title, article.description),
      tags: extractKeywords(article.title, article.description),
      hotScore: calculateHotScore(article.published || new Date().toISOString()),
      readCount: Math.floor(Math.random() * 50000) + 5000,
      url: article.url || '',
      trend: inferTrend()
    }));
  } catch (error) {
    console.error('Currents fetch error:', error);
    return [];
  }
}

// 从NewsData.io获取新闻
async function fetchFromNewsData(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    console.log('NEWSDATA_API_KEY not configured');
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      category: 'business',
      country: 'cn',
      language: 'zh'
    });
    
    const response = await fetch(`https://newsdata.io/api/1/news?${params}`);
    
    if (!response.ok) {
      console.log('NewsData API failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    return data.results.map((article: any, index: number) => ({
      id: `newsdata-${Date.now()}-${index}`,
      title: article.title || '',
      summary: article.description || '',
      source: article.source_id || 'NewsData',
      publishTime: article.pubDate || new Date().toISOString(),
      category: inferCategory(article.title, article.description),
      tags: extractKeywords(article.title, article.description),
      hotScore: calculateHotScore(article.pubDate || new Date().toISOString()),
      readCount: Math.floor(Math.random() * 50000) + 5000,
      url: article.link || '',
      trend: inferTrend()
    }));
  } catch (error) {
    console.error('NewsData fetch error:', error);
    return [];
  }
}

// 使用Jina.ai Reader获取新闻内容
async function fetchWithJinaReader(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain'
      }
    });
    
    if (response.ok) {
      return await response.text();
    }
    return '';
  } catch (error) {
    console.error('Jina Reader error:', error);
    return '';
  }
}

// 从权威财经网站抓取新闻（使用Jina.ai Reader）
async function fetchFromAuthoritySites(): Promise<NewsItem[]> {
  const sources = [
    {
      name: '新浪财经',
      url: 'https://finance.sina.com.cn/',
      category: '财经要闻'
    },
    {
      name: '东方财富',
      url: 'https://www.eastmoney.com/',
      category: '股市行情'
    },
    {
      name: '财联社',
      url: 'https://www.cls.cn/',
      category: '财经要闻'
    }
  ];
  
  const newsItems: NewsItem[] = [];
  
  for (const source of sources) {
    try {
      const content = await fetchWithJinaReader(source.url);
      
      if (content && content.length > 100) {
        // 解析Markdown内容，提取新闻标题
        const lines = content.split('\n').filter(line => line.trim());
        let count = 0;
        
        for (const line of lines) {
          // 提取标题（通常是带链接的文本）
          const titleMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (titleMatch && titleMatch[1].length > 10 && count < 5) {
            const title = titleMatch[1].trim();
            const url = titleMatch[2];
            
            // 过滤掉导航链接
            if (title.includes('登录') || title.includes('注册') || 
                title.includes('下载') || title.includes('APP') ||
                url.includes('javascript') || url.includes('#')) {
              continue;
            }
            
            newsItems.push({
              id: `authority-${Date.now()}-${count}`,
              title: title,
              summary: '',
              source: source.name,
              publishTime: new Date().toISOString(),
              category: source.category,
              tags: extractKeywords(title),
              hotScore: calculateHotScore(new Date().toISOString()),
              readCount: Math.floor(Math.random() * 50000) + 5000,
              url: url.startsWith('http') ? url : source.url,
              trend: inferTrend()
            });
            
            count++;
          }
        }
      }
    } catch (error) {
      console.error(`Failed to fetch from ${source.name}:`, error);
    }
  }
  
  return newsItems;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const { category, search, tag } = req.query;
    
    console.log('Fetching news from multiple sources...');
    
    // 并发从多个API获取新闻
    const apiResults = await Promise.all([
      fetchFromGNews(),
      fetchFromNewsAPI(),
      fetchFromCurrents(),
      fetchFromNewsData(),
      fetchFromAuthoritySites()
    ]);
    
    // 合并所有新闻
    let newsItems: NewsItem[] = [];
    apiResults.forEach(results => {
      if (results && results.length > 0) {
        newsItems = newsItems.concat(results);
      }
    });
    
    console.log(`Total news fetched: ${newsItems.length}`);
    
    // 去重（根据标题）
    const uniqueNews = newsItems.filter((news, index, self) =>
      index === self.findIndex(n => n.title === news.title)
    );
    
    // 如果没有获取到任何新闻
    if (uniqueNews.length === 0) {
      return res.status(200).json({
        success: false,
        data: [],
        total: 0,
        message: '未能获取到新闻数据。请配置新闻API密钥（GNEWS_API_KEY、NEWS_API_KEY、CURRENTS_API_KEY 或 NEWSDATA_API_KEY）',
        instructions: {
          gnews: 'https://gnews.io/register - 每天免费100个请求',
          newsapi: 'https://newsapi.org/register - 每天免费100个请求',
          currents: 'https://currentsapi.services/register - 每天免费200个请求',
          newsdata: 'https://newsdata.io/register - 每天免费200个请求'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // 按分类筛选
    if (category && category !== '全部') {
      const categoryStr = category as string;
      uniqueNews.filter(item => item.category === categoryStr);
    }
    
    // 按标签筛选
    if (tag) {
      const tagStr = tag as string;
      uniqueNews.filter(item => item.tags.includes(tagStr));
    }
    
    // 搜索筛选
    if (search) {
      const searchLower = (search as string).toLowerCase();
      uniqueNews.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower)
      );
    }
    
    // 按热度排序
    uniqueNews.sort((a, b) => b.hotScore - a.hotScore);
    
    // 返回结果
    res.status(200).json({
      success: true,
      data: uniqueNews,
      total: uniqueNews.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('News API Error:', error);
    
    res.status(500).json({
      success: false,
      error: '获取新闻失败',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
