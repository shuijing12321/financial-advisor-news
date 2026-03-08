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

// 使用 Jina.ai Reader 抓取网页内容
async function fetchWithJina(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain'
      },
      signal: AbortSignal.timeout(15000) // 15秒超时
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

// 从新浪财经抓取新闻
async function fetchFromSina(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://finance.sina.com.cn/7x24/');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      // 匹配新闻标题和链接
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        // 过滤无效链接
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('注册') ||
            title.includes('下载') ||
            url.includes('javascript') ||
            url.includes('#') ||
            !url.startsWith('http')) {
          continue;
        }
        
        // 检查是否包含财经关键词
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `sina-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '新浪财经',
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
    
    return newsItems;
  } catch (error) {
    console.error('Sina fetch error:', error);
    return [];
  }
}

// 从东方财富抓取新闻
async function fetchFromEastmoney(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://www.eastmoney.com/');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('注册') ||
            title.includes('下载') ||
            title.includes('APP') ||
            url.includes('javascript') ||
            url.includes('#')) {
          continue;
        }
        
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `eastmoney-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '东方财富',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://www.eastmoney.com${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('Eastmoney fetch error:', error);
    return [];
  }
}

// 从财联社抓取新闻
async function fetchFromCLS(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://www.cls.cn/telegraph');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('注册') ||
            url.includes('javascript')) {
          continue;
        }
        
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `cls-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '财联社',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://www.cls.cn${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('CLS fetch error:', error);
    return [];
  }
}

// 从同花顺抓取新闻
async function fetchFrom10jqka(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://news.10jqka.com.cn/guonei_list.shtml');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            url.includes('javascript')) {
          continue;
        }
        
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `10jqka-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '同花顺',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://news.10jqka.com.cn${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('10jqka fetch error:', error);
    return [];
  }
}

// 从界面新闻抓取
async function fetchFromJiemian(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://www.jiemian.com/');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('注册') ||
            url.includes('javascript')) {
          continue;
        }
        
        // 界面新闻是综合新闻，筛选财经相关
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `jiemian-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '界面新闻',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://www.jiemian.com${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('Jiemian fetch error:', error);
    return [];
  }
}

// 从虎嗅抓取财经新闻
async function fetchFromHuxiu(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://www.huxiu.com/channel/106.html');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('APP') ||
            url.includes('javascript')) {
          continue;
        }
        
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `huxiu-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '虎嗅',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://www.huxiu.com${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('Huxiu fetch error:', error);
    return [];
  }
}

// 从36氪抓取财经新闻
async function fetchFrom36Kr(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://36kr.com/newsflashes');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('APP') ||
            url.includes('javascript')) {
          continue;
        }
        
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `36kr-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '36氪',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://36kr.com${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('36Kr fetch error:', error);
    return [];
  }
}

// 从雪球抓取热门讨论
async function fetchFromXueqiu(): Promise<NewsItem[]> {
  try {
    const content = await fetchWithJina('https://xueqiu.com/hots');
    if (!content) return [];
    
    const newsItems: NewsItem[] = [];
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match && count < 10) {
        const title = match[1].trim();
        const url = match[2];
        
        if (title.length < 10 || 
            title.includes('登录') || 
            title.includes('抱歉') ||
            url.includes('javascript')) {
          continue;
        }
        
        const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => title.includes(kw));
        if (!hasFinanceKeyword) continue;
        
        newsItems.push({
          id: `xueqiu-${Date.now()}-${count}`,
          title: title,
          summary: '',
          source: '雪球',
          publishTime: new Date().toISOString(),
          category: inferCategory(title),
          tags: extractKeywords(title),
          hotScore: calculateHotScore(new Date().toISOString()),
          readCount: Math.floor(Math.random() * 50000) + 10000,
          url: url.startsWith('http') ? url : `https://xueqiu.com${url}`,
          trend: inferTrend()
        });
        
        count++;
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error('Xueqiu fetch error:', error);
    return [];
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
    
    console.log('[News API] 开始从权威网站抓取新闻...');
    
    // 并发抓取多个新闻源
    const results = await Promise.all([
      fetchFromSina(),
      fetchFromEastmoney(),
      fetchFromCLS(),
      fetchFrom10jqka(),
      fetchFromJiemian(),
      fetchFromHuxiu(),
      fetchFrom36Kr(),
      fetchFromXueqiu()
    ]);
    
    // 合并所有新闻
    let newsItems: NewsItem[] = [];
    results.forEach(items => {
      if (items && items.length > 0) {
        newsItems = newsItems.concat(items);
      }
    });
    
    console.log(`[News API] 共抓取到 ${newsItems.length} 条新闻`);
    
    // 去重（根据标题相似度）
    const uniqueNews: NewsItem[] = [];
    const seenTitles = new Set<string>();
    
    for (const news of newsItems) {
      const normalizedTitle = news.title.replace(/\s+/g, '').substring(0, 20);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueNews.push(news);
      }
    }
    
    console.log(`[News API] 去重后剩余 ${uniqueNews.length} 条新闻`);
    
    // 如果没有新闻，返回提示
    if (uniqueNews.length === 0) {
      return res.status(200).json({
        success: false,
        data: [],
        total: 0,
        message: '暂时无法从新闻源获取数据，请稍后重试',
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
    
    // 按热度排序
    filteredNews.sort((a, b) => b.hotScore - a.hotScore);
    
    // 返回结果
    res.status(200).json({
      success: true,
      data: filteredNews,
      total: filteredNews.length,
      sources: ['新浪财经', '东方财富', '财联社', '同花顺', '界面新闻', '虎嗅', '36氪', '雪球'],
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
