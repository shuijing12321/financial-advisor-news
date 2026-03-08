# 金融投顾素材助手

基于 Next.js + TypeScript + TailwindCSS 构建的金融投顾素材生成平台。

## 🎯 核心功能

### 1. 热点新闻聚合
- **真实数据源**：通过 RSS 聚合新华社、人民网、中国证券报、上海证券报、证券时报、第一财经等权威财经媒体
- **实时更新**：支持一键刷新获取最新新闻
- **原文链接**：每条新闻都提供原文链接，方便查看详情
- **热点词云**：基于新闻标签自动生成热点关键词云，点击即可筛选相关新闻

### 2. AI 素材生成
- **多种类型**：支持短视频、图文、直播话术、社交媒体四种素材类型
- **灵活配置**：
  - 本地模板：无需API Key，使用预设模板快速生成
  - OpenAI：接入 GPT 模型生成更智能的内容
  - Anthropic：接入 Claude 模型生成高质量内容
- **可编辑**：生成的内容支持手动编辑调整

### 3. 素材管理
- 本地存储：素材保存在浏览器本地，支持增删改查
- 一键复制：快速复制素材内容
- 分类筛选：按类型、状态筛选素材

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建
```bash
npm run build
npm start
```

## 📝 配置说明

### AI 配置
在网页的"AI设置"中配置即可，支持：
- **本地模板**：无需任何配置，开箱即用
- **OpenAI**：需要 OpenAI API Key
- **Anthropic**：需要 Anthropic API Key

API Key 仅保存在本地浏览器，不会上传到服务器。

### 新闻源配置（可选）
项目默认通过 RSS 自动抓取新闻，如需使用额外的新闻 API，可在 `.env.local` 中配置：

```env
NEWSDATA_API_KEY=your_key
GNEWS_API_KEY=your_key
```

## 📰 新闻数据源

### RSS 源（默认启用）
- 新华社财经
- 人民网财经
- 中国证券报
- 上海证券报
- 证券时报
- 第一财经
- 财新网
- 经济日报

### API 源（需配置 API Key）
- NewsData.io
- GNews

## 🛠️ 技术栈

- **框架**：Next.js 14
- **语言**：TypeScript
- **样式**：TailwindCSS
- **图标**：Lucide React
- **HTTP 客户端**：Axios
- **RSS 解析**：xml2js

## 📂 项目结构

```
financial-advisor-news/
├── pages/
│   ├── api/
│   │   ├── news.ts        # 新闻聚合 API
│   │   └── generate.ts    # AI 生成 API
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx          # 首页（热点新闻+数据分析）
│   ├── generate.tsx       # AI 素材生成
│   └── materials.tsx      # 素材管理
├── components/
│   └── Layout.tsx         # 布局组件
├── lib/
│   ├── newsApi.ts         # 新闻服务
│   ├── aiService.ts       # AI 服务
│   └── materialStorage.ts # 素材存储
├── types/
│   └── index.ts           # 类型定义
└── styles/
    └── globals.css        # 全局样式
```

## ⚠️ 注意事项

1. **新闻来源**：新闻通过 CORS 代理从 RSS 源抓取，部分源可能因网络问题无法访问
2. **API Key 安全**：请勿在公开环境中暴露您的 API Key
3. **数据存储**：素材目前存储在浏览器本地，清除浏览器数据会丢失
4. **合规使用**：生成的内容仅供参考，不构成投资建议

## 📄 License

MIT
