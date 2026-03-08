// 新闻类型定义
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  tags: string[];
  publishTime: string;
  url?: string;
  imageUrl?: string;
  hotScore?: number; // 热度分数
  readCount?: number; // 阅读量
}

// 素材类型
export type MaterialType = 'video' | 'article' | 'livestream' | 'social';

// 素材状态
export type MaterialStatus = 'draft' | 'published' | 'archived';

// 素材定义
export interface Material {
  id: string;
  newsId: string;
  type: MaterialType;
  title: string;
  content: string;
  script?: string; // 视频脚本/直播话术
  tags: string[];
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}

// 时间周期
export type TimePeriod = 'daily' | 'weekly' | 'monthly';

// 热点统计数据
export interface HotTopicStats {
  topic: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

// 分类定义
export const categories = [
  '宏观经济',
  '股市行情',
  '基金理财',
  '银行保险',
  '外汇期货',
  '区块链',
  '科技金融',
  '政策法规',
  '国际财经',
  '产业动态'
] as const;

export type Category = typeof categories[number];

// 标签定义
export const defaultTags = [
  '投资机会',
  '风险提示',
  '政策解读',
  '市场分析',
  '行业趋势',
  '理财知识',
  '热点解读',
  '投资策略'
] as const;

export type Tag = typeof defaultTags[number];

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}
