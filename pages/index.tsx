import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsItem, categories, HotTopicStats } from '@/types';
import { Search, TrendingUp, Clock, ChevronRight, RefreshCw, ExternalLink, BarChart2, TrendingDown, Minus, AlertCircle } from 'lucide-react';

export default function Home() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hotTopics, setHotTopics] = useState<HotTopicStats[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/news');
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        let filteredNews = result.data;
        
        // 按分类筛选
        if (selectedCategory && selectedCategory !== '全部') {
          filteredNews = filteredNews.filter((news: NewsItem) => 
            news.category === selectedCategory
          );
        }
        
        setNewsList(filteredNews);
        
        // 生成热点统计
        const topics = generateHotTopics(filteredNews);
        setHotTopics(topics);
      } else {
        // 没有获取到新闻
        setNewsList([]);
        setHotTopics([]);
        setError(result.message || '无法获取新闻数据，请检查网络连接或稍后重试');
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      setNewsList([]);
      setHotTopics([]);
      setError('网络请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 生成热点话题统计
  // 逻辑：从新闻的 tags 字段统计出现频率，生成热点词云
  const generateHotTopics = (news: NewsItem[]): HotTopicStats[] => {
    const topicCounts: Record<string, { count: number; category: string }> = {};
    
    // 遍历所有新闻，统计每个标签出现的次数
    news.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (!topicCounts[tag]) {
            topicCounts[tag] = { count: 0, category: item.category };
          }
          topicCounts[tag].count++;
        });
      }
    });
    
    // 转换为数组，计算趋势，并排序
    const topics: HotTopicStats[] = Object.entries(topicCounts)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        // 趋势：随机生成，实际应用中应该基于历史数据对比
        trend: (Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
        category: data.category
      }))
      .sort((a, b) => b.count - a.count) // 按出现次数降序
      .slice(0, 15); // 取前15个
    
    return topics;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      loadNews();
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = newsList.filter(news => 
      news.title.toLowerCase().includes(lowerQuery) ||
      news.summary.toLowerCase().includes(lowerQuery) ||
      news.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    setNewsList(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffHours < 48) return '昨天';
    return date.toLocaleDateString('zh-CN');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const maxCount = Math.max(...hotTopics.map(t => t.count), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">热点新闻</h1>
          <p className="text-gray-600 mt-1">实时聚合百度热搜、知乎热榜、微博热搜、36氪等热点资讯</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showAnalysis ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>{showAnalysis ? '隐藏分析' : '显示分析'}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>
      </div>

      {/* 数据来源说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>数据来源：</strong> 百度热搜、知乎热榜、微博热搜、36氪、虎嗅、雪球、东方财富等（实时抓取）
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">获取新闻失败</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              点击重试
            </button>
          </div>
        </div>
      )}

      {/* Hot Topics Analysis */}
      {showAnalysis && hotTopics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-primary-600" />
              热点词云
            </h3>
            <span className="text-sm text-gray-500">
              基于新闻标签统计 · 点击关键词筛选
            </span>
          </div>
          
          {/* Word Cloud */}
          <div className="flex flex-wrap gap-3 items-center justify-center min-h-[120px] py-4 mb-4">
            {hotTopics.map((topic) => {
              const fontSize = 12 + (topic.count / maxCount) * 28;
              const opacity = 0.5 + (topic.count / maxCount) * 0.5;
              
              return (
                <button
                  key={topic.topic}
                  onClick={() => {
                    setSearchQuery(topic.topic);
                    handleSearch();
                  }}
                  className={`font-semibold cursor-pointer hover:scale-110 transition-all px-2 py-1 rounded ${
                    topic.trend === 'up' ? 'text-green-600 hover:bg-green-50' :
                    topic.trend === 'down' ? 'text-red-600 hover:bg-red-50' :
                    'text-primary-600 hover:bg-primary-50'
                  }`}
                  style={{ 
                    fontSize: `${fontSize}px`,
                    opacity: opacity
                  }}
                  title={`${topic.topic} - ${topic.count}条相关新闻`}
                >
                  {topic.topic}
                </button>
              );
            })}
          </div>

          {/* Hot Topics List */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">热门话题排行 TOP 10</h4>
            <div className="space-y-3">
              {hotTopics.slice(0, 10).map((topic, index) => (
                <div 
                  key={topic.topic} 
                  className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  onClick={() => {
                    setSearchQuery(topic.topic);
                    handleSearch();
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {index < 3 ? (
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-orange-400'
                      }`}>
                        {index + 1}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{topic.topic}</span>
                        <span className="text-xs text-gray-500">{topic.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-700">{topic.count}</span>
                        {getTrendIcon(topic.trend)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          topic.trend === 'up' ? 'bg-green-500' :
                          topic.trend === 'down' ? 'bg-red-400' :
                          'bg-primary-500'
                        }`}
                        style={{ width: `${(topic.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索新闻、关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          搜索
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSelectedCategory('全部');
            loadNews();
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === '全部'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              loadNews();
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">正在获取新闻数据...</span>
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">暂无新闻数据</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            刷新重试
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-2">
            共获取到 {newsList.length} 条新闻
          </div>
          <div className="grid gap-4">
            {newsList.map((news, index) => (
              <div
                key={news.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {news.category}
                      </span>
                      {news.hotScore && news.hotScore >= 80 && (
                        <span className="flex items-center text-orange-500 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          热门
                        </span>
                      )}
                      <span className="text-xs text-gray-500">来源：{news.source}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {news.summary}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(news.publishTime)}
                      </span>
                      {news.readCount && (
                        <span>阅读：{(news.readCount / 10000).toFixed(1)}万</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {news.tags?.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-primary-100 hover:text-primary-700 transition-colors"
                          onClick={() => {
                            setSearchQuery(tag);
                            handleSearch();
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      href={`/generate?newsId=${news.id}&title=${encodeURIComponent(news.title)}&summary=${encodeURIComponent(news.summary)}&category=${encodeURIComponent(news.category)}`}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                    >
                      <span>生成素材</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {news.url && !news.url.includes('google.com/search') && (
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>原文</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Update Time */}
      {newsList.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          数据更新时间：{new Date().toLocaleString('zh-CN')}
        </div>
      )}
    </div>
  );
}
