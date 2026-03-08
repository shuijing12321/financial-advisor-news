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
  '宏观经济': ['央行', '货币政策', '利率', 'GDP', 'CPI', 'PPI', '经济', '财政', '发改委'],
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

// RSS Feed 源（这些是最可靠的）
const RSS_FEEDS = [
  {
    name: '新华网财经',
    url: 'http://www.xinhuanet.com/fortune/news_finance.xml',
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
  },
  {
    name: '经济参考报',
    url: 'http://www.jjckb.cn/rss/jjckb.xml',
    category: '宏观经济'
  },
  {
    name: '第一财经',
    url: 'https://www.yicai.com/rss/',
    category: '财经要闻'
  },
  {
    name: '财新网',
    url: 'https://r.jina.ai/http://feed.caixin.com/caixin.xml',
    category: '财经要闻'
  },
  {
    name: 'FT中文网',
    url: 'https://r.jina.ai/http://www.ftchinese.com/rss/feed',
    category: '国际财经'
  }
];

// 解析RSS XML
function parseRSSXML(xml: string, source: string, category: string): NewsItem[] {
  const newsItems: NewsItem[] = [];
  
  try {
    // 简单的XML解析（提取title, link, description, pubDate）
    const items = xml.split('<item>');
    
    for (let i = 1; i < items.length && i <= 10; i++) {
      const item = items[i];
      
      // 提取标题
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : '';
      
      if (!title || title.length < 10) continue;
      
      // 提取链接
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : '';
      
      // 提取描述
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
      const description = descMatch ? (descMatch[1] || descMatch[2]).trim() : '';
      
      // 提取发布时间
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      
      // 过滤掉非财经新闻
      const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => 
        title.includes(kw) || description.includes(kw)
      );
      
      if (!hasFinanceKeyword) continue;
      
      newsItems.push({
        id: `rss-${Date.now()}-${i}`,
        title: title,
        summary: description.substring(0, 200),
        source: source,
        publishTime: pubDate,
        category: inferCategory(title, description),
        tags: extractKeywords(title, description),
        hotScore: calculateHotScore(pubDate),
        readCount: Math.floor(Math.random() * 50000) + 10000,
        url: link,
        trend: inferTrend()
      });
    }
  } catch (error) {
    console.error('RSS parse error:', error);
  }
  
  return newsItems;
}

// 获取RSS Feed
async function fetchRSSFeed(feed: typeof RSS_FEEDS[0]): Promise<NewsItem[]> {
  try {
    // 使用Jina.ai Reader来获取RSS（绕过CORS）
    const jinaUrl = `https://r.jina.ai/${feed.url}`;
    
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      console.log(`RSS fetch failed for ${feed.name}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    
    if (!xml || xml.length < 100) {
      return [];
    }
    
    // 尝试解析RSS
    return parseRSSXML(xml, feed.name, feed.category);
    
  } catch (error) {
    console.error(`Failed to fetch RSS from ${feed.name}:`, error);
    return [];
  }
}

// 从免费新闻API获取（不需要key的）
async function fetchFromFreeAPIs(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  // 尝试从一个免费的新闻聚合API
  try {
    // 使用Mediastack免费API（需要注册但有免费额度）
    // 或者使用其他免费接口
    
    // 尝试从公开的新闻JSON API
    const apis = [
      {
        url: 'https://api.currentsapi.services/v1/latest-news',
        params: '?language=zh&category=business',
        parse: (data: any) => data.news || []
      }
    ];
    
    // 由于大多数新闻API都需要key，这里我们主要依赖RSS
    // 如果有免费的公开API，可以在这里添加
    
  } catch (error) {
    console.error('Free API fetch error:', error);
  }
  
  return newsItems;
}

// 从专业财经网站抓取（改进版，更严格的内容过滤）
async function fetchFromFinancialSites(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  // 使用更好的新闻列表页面
  const sources = [
    {
      name: '新浪财经7x24',
      url: 'https://finance.sina.com.cn/7x24/',
      source: '新浪财经'
    },
    {
      name: '东方财富要闻',
      url: 'https://news.eastmoney.com/',
      source: '东方财富'
    }
  ];
  
  for (const source of sources) {
    try {
      const content = await fetchWithJina(source.url);
      
      if (!content || content.length < 100) continue;
      
      const lines = content.split('\n');
      let count = 0;
      
      for (const line of lines) {
        // 更严格的匹配：标题必须在15-80字符之间
        const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        
        if (match && count < 10) {
          const title = match[1].trim();
          const url = match[2];
          
          // 严格过滤
          if (
            title.length < 15 || 
            title.length > 80 ||
            title.includes('登录') || 
            title.includes('注册') ||
            title.includes('下载') ||
            title.includes('APP') ||
            title.includes('手机版') ||
            title.includes('客户端') ||
            title.includes('查看榜单') ||
            title.includes('规则') ||
            title.startsWith('Title:') ||
            title.startsWith('Markdown') ||
            title.startsWith('Image') ||
            title.startsWith('!') ||
            title.includes('抱歉') ||
            title.includes('没有找到') ||
            url.includes('javascript') ||
            url.includes('#') ||
            !url.startsWith('http')
          ) {
            continue;
          }
          
          // 必须包含财经关键词
          const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
          if (!hasFinanceKeyword) continue;
          
          newsItems.push({
            id: `web-${Date.now()}-${count}-${Math.random()}`,
            title: title,
            summary: '',
            source: source.source,
            publishTime: new Date().toISOString(),
            category: inferCategory(title),
            tags: extractKeywords(title),
            hotScore: calculateHotScore(new Date().toISOString()),
            readCount: Math.floor(Math.random() * 50000) + 10000,
            url: url,
            trend: inferTrend()
          });
          
          count++;
        }
      }
      
    } catch (error) {
      console.error(`Failed to fetch from ${source.name}:`, error);
    }
  }
  
  return newsItems;
}

// Jina.ai Reader 辅助函数
async function fetchWithJina(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (response.ok) {
      return await response.text();
    }
    return '';
  } catch (error) {
    console.error('Jina fetch error:', error);
    return '';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const { category, search, tag } = req.query;
    
    console.log('[News API] 开始获取新闻...');
    
    // 并发获取新闻
    const rssResults = await Promise.all(
      RSS_FEEDS.map(feed => fetchRSSFeed(feed))
    );
    
    const webResults = await fetchFromFinancialSites();
    
    // 合并所有新闻
    let newsItems: NewsItem[] = [];
    
    rssResults.forEach(items => {
      if (items && items.length > 0) {
        newsItems = newsItems.concat(items);
      }
    });
    
    newsItems = newsItems.concat(webResults);
    
    console.log(`[News API] 共获取到 ${newsItems.length} 条新闻`);
    
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
    
    console.log(`[News API] 去重后 ${uniqueNews.length} 条`);
    
    // 如果没有新闻
    if (uniqueNews.length === 0) {
      return res.status(200).json({
        success: false,
        data: [],
        total: 0,
        message: '暂时无法获取新闻，请稍后重试',
        timestamp: new Date().toISOString()
      });
    }
    
    // 筛选
    let filteredNews = [...uniqueNews];
    
    if (category && category !== '全部') {
      const categoryStr = category as string;
      filteredNews = filteredNews.filter(item => item.category === categoryStr);
    }
    
    if (tag) {
      const tagStr = tag as string;
      filteredNews = filteredNews.filter(item => item.tags.includes(tagStr));
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
      sources: ['新华网', '人民网', '中国证券报', '上海证券报', '经济参考报', '第一财经', '财新网', 'FT中文网', '新浪财经', '东方财富'],
      timestamp: new Date().toISOString()
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
// Force rebuild Sun Mar  8 17:32:37 CST 2026
