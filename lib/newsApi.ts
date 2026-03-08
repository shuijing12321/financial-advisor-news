import axios from 'axios';
import { NewsItem, HotTopicStats } from '@/types';

// 新闻 API 服务
// 使用多个公开新闻源

const NEWS_SOURCES = {
  // RSS 源配置
  rss: {
    reuters: 'https://news.google.com/rss/search?q=finance+when:24h&hl=en-US&gl=US&ceid=US:en',
    bbc: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    cnbc: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
  },
  // NewsAPI (免费额度有限)
  newsApi: 'https://newsapi.org/v2',
  // GNews
  gnews: 'https://gnews.io/api/v4',
  // 当前新闻 (免费 API)
  currents: 'https://api.currentsapi.services/v1'
};

// 模拟数据 - 用于开发和测试
const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: '央行发布最新货币政策报告：保持流动性合理充裕',
    summary: '中国人民银行今日发布2026年第一季度货币政策执行报告，强调将继续实施稳健的货币政策，保持流动性合理充裕，支持实体经济高质量发展。',
    source: '新华社',
    category: '宏观经济',
    tags: ['货币政策', '央行', '流动性'],
    publishTime: new Date().toISOString(),
    hotScore: 95,
    readCount: 125000
  },
  {
    id: '2',
    title: 'A股三大指数集体上涨 科技板块领涨',
    summary: '今日A股市场表现强劲，上证指数上涨1.2%，深证成指上涨1.5%，创业板指上涨1.8%。科技板块表现亮眼，半导体、人工智能相关个股涨幅居前。',
    source: '证券时报',
    category: '股市行情',
    tags: ['A股', '科技股', '投资机会'],
    publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hotScore: 88,
    readCount: 98000
  },
  {
    id: '3',
    title: '美联储维持利率不变 市场预期年内可能降息',
    summary: '美联储宣布维持联邦基金利率目标区间在5.25%-5.50%不变，符合市场预期。鲍威尔表示将继续评估经济数据，市场普遍预期年内可能开始降息。',
    source: '华尔街日报',
    category: '国际财经',
    tags: ['美联储', '利率', '货币政策'],
    publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    hotScore: 92,
    readCount: 145000
  },
  {
    id: '4',
    title: '黄金价格创历史新高 避险需求持续升温',
    summary: '受地缘政治紧张局势影响，国际金价今日突破2100美元/盎司，创历史新高。分析师认为，避险情绪升温将继续支撑金价走势。',
    source: '财经网',
    category: '外汇期货',
    tags: ['黄金', '避险资产', '投资机会'],
    publishTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    hotScore: 85,
    readCount: 76000
  },
  {
    id: '5',
    title: '新能源汽车销量再创新高 产业链持续受益',
    summary: '数据显示，2026年1-2月新能源汽车销量同比增长35%，渗透率达到35%。宁德时代、比亚迪等产业链龙头企业业绩亮眼。',
    source: '第一财经',
    category: '产业动态',
    tags: ['新能源', '产业链', '投资机会'],
    publishTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    hotScore: 82,
    readCount: 68000
  },
  {
    id: '6',
    title: '证监会发布新规 优化IPO审核机制',
    summary: '证监会发布《关于优化首次公开发行股票审核机制的通知》，旨在提高审核效率，优化资源配置，更好服务实体经济发展。',
    source: '证监会官网',
    category: '政策法规',
    tags: ['IPO', '政策解读', '监管'],
    publishTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    hotScore: 78,
    readCount: 52000
  },
  {
    id: '7',
    title: '公募基金规模突破30万亿 权益类产品受青睐',
    summary: '中国证券投资基金业协会数据显示，截至2026年2月底，公募基金管理规模突破30万亿元，权益类基金占比持续提升。',
    source: '中国基金报',
    category: '基金理财',
    tags: ['公募基金', '理财', '投资策略'],
    publishTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    hotScore: 75,
    readCount: 45000
  },
  {
    id: '8',
    title: '人民币汇率企稳回升 外资持续流入A股',
    summary: '在岸人民币兑美元汇率今日收报7.18，较前一交易日上涨150个基点。数据显示，本月北向资金净流入超500亿元。',
    source: '财联社',
    category: '外汇期货',
    tags: ['汇率', '北向资金', '市场分析'],
    publishTime: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    hotScore: 72,
    readCount: 38000
  },
  {
    id: '9',
    title: '央行数字货币试点扩大 应用场景持续丰富',
    summary: '人民银行宣布数字人民币试点范围扩大至更多城市，涵盖零售、交通、医疗等多个应用场景，用户体验进一步优化。',
    source: '金融时报',
    category: '科技金融',
    tags: ['数字货币', '金融科技', '创新'],
    publishTime: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    hotScore: 70,
    readCount: 35000
  },
  {
    id: '10',
    title: '银行业绩稳健增长 不良率保持低位',
    summary: '上市银行年报显示，2025年银行业整体业绩稳健增长，平均不良贷款率维持在1.2%左右，风险抵御能力持续增强。',
    source: '中国证券报',
    category: '银行保险',
    tags: ['银行', '业绩', '风险提示'],
    publishTime: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    hotScore: 68,
    readCount: 32000
  }
];

// 热点统计模拟数据
const mockHotTopicStats: HotTopicStats[] = [
  { topic: '货币政策', count: 45, trend: 'up', category: '宏观经济' },
  { topic: 'A股', count: 38, trend: 'stable', category: '股市行情' },
  { topic: '美联储', count: 35, trend: 'up', category: '国际财经' },
  { topic: '新能源', count: 32, trend: 'up', category: '产业动态' },
  { topic: '黄金', count: 28, trend: 'up', category: '外汇期货' },
  { topic: '公募基金', count: 25, trend: 'stable', category: '基金理财' },
  { topic: '数字货币', count: 22, trend: 'up', category: '科技金融' },
  { topic: 'IPO', count: 20, trend: 'down', category: '政策法规' },
  { topic: '人民币汇率', count: 18, trend: 'stable', category: '外汇期货' },
  { topic: '银行业绩', count: 15, trend: 'stable', category: '银行保险' },
];

// 获取新闻列表
export async function getNewsList(params?: {
  category?: string;
  tag?: string;
  period?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ news: NewsItem[]; total: number }> {
  // 模拟 API 调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredNews = [...mockNewsData];
  
  // 按分类筛选
  if (params?.category && params.category !== '全部') {
    filteredNews = filteredNews.filter(news => news.category === params.category);
  }
  
  // 按标签筛选
  if (params?.tag) {
    const tag = params.tag as string;
    filteredNews = filteredNews.filter(news => news.tags.includes(tag));
  }
  
  // 分页
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const total = filteredNews.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    news: filteredNews.slice(start, end),
    total
  };
}

// 获取单条新闻详情
export async function getNewsDetail(id: string): Promise<NewsItem | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockNewsData.find(news => news.id === id) || null;
}

// 获取热点统计
export async function getHotTopicStats(period: string = 'daily'): Promise<HotTopicStats[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockHotTopicStats;
}

// 搜索新闻
export async function searchNews(keyword: string): Promise<NewsItem[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const lowerKeyword = keyword.toLowerCase();
  return mockNewsData.filter(news => 
    news.title.toLowerCase().includes(lowerKeyword) ||
    news.summary.toLowerCase().includes(lowerKeyword) ||
    news.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

// 实际 API 调用函数（用于生产环境）
// 注意：这些函数需要 API Key，建议在后端调用

export async function fetchFromNewsAPI(params: {
  apiKey: string;
  query?: string;
  category?: string;
}): Promise<any> {
  try {
    const response = await axios.get(`${NEWS_SOURCES.newsApi}/everything`, {
      params: {
        apiKey: params.apiKey,
        q: params.query || 'finance OR business OR economy',
        language: 'zh',
        sortBy: 'publishedAt',
        pageSize: 20
      }
    });
    return response.data;
  } catch (error) {
    console.error('NewsAPI Error:', error);
    throw error;
  }
}

export async function fetchFromGNews(params: {
  apiKey: string;
  query?: string;
}): Promise<any> {
  try {
    const response = await axios.get(NEWS_SOURCES.gnews, {
      params: {
        token: params.apiKey,
        q: params.query || 'finance business economy',
        lang: 'zh',
        max: 20
      }
    });
    return response.data;
  } catch (error) {
    console.error('GNews Error:', error);
    throw error;
  }
}

export async function fetchFromCurrents(params: {
  apiKey: string;
  category?: string;
}): Promise<any> {
  try {
    const response = await axios.get(`${NEWS_SOURCES.currents}/latest-news`, {
      params: {
        apiKey: params.apiKey,
        language: 'zh',
        category: params.category || 'business'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Currents API Error:', error);
    throw error;
  }
}
