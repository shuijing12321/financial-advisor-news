# 配置新闻 API 密钥

## 为什么需要配置 API 密钥？

本项目**不使用任何模拟数据**，所有新闻都从真实的权威新闻源获取。

为了获取新闻数据，需要配置至少一个新闻 API 密钥。

---

## 可用的新闻 API（都是免费的）

### 1. GNews API（推荐）
- **免费额度**：每天 100 个请求
- **注册地址**：https://gnews.io/register
- **环境变量**：`GNEWS_API_KEY`
- **特点**：支持中文新闻，响应快

### 2. NewsAPI
- **免费额度**：每天 100 个请求
- **注册地址**：https://newsapi.org/register
- **环境变量**：`NEWS_API_KEY`
- **特点**：新闻源丰富，更新及时

### 3. Currents API
- **免费额度**：每天 200 个请求
- **注册地址**：https://currentsapi.services/register
- **环境变量**：`CURRENTS_API_KEY`
- **特点**：免费额度最多

### 4. NewsData.io
- **免费额度**：每天 200 个请求
- **注册地址**：https://newsdata.io/register
- **环境变量**：`NEWSDATA_API_KEY`
- **特点**：支持多语言

---

## 在 Vercel 中配置

### 步骤 1：获取 API 密钥

1. 访问上述任一 API 注册页面
2. 注册账号
3. 复制 API Key

### 步骤 2：在 Vercel 中配置

1. 打开 Vercel Dashboard：https://vercel.com/dashboard
2. 选择你的项目：`financial-advisor-news`
3. 点击 **Settings** 标签
4. 点击左侧 **Environment Variables**
5. 添加环境变量：

| Name | Value | Environment |
|------|-------|-------------|
| GNEWS_API_KEY | 你的密钥 | Production, Preview, Development |
| NEWS_API_KEY | 你的密钥 | Production, Preview, Development |
| CURRENTS_API_KEY | 你的密钥 | Production, Preview, Development |
| NEWSDATA_API_KEY | 你的密钥 | Production, Preview, Development |

### 步骤 3：重新部署

配置环境变量后，需要重新部署：

1. 在 Vercel Dashboard 点击 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧 **...** 按钮
4. 选择 **Redeploy**

---

## 本地开发配置

在项目根目录创建 `.env.local` 文件：

```env
# 新闻 API 密钥（至少配置一个）
GNEWS_API_KEY=你的密钥
NEWS_API_KEY=你的密钥
CURRENTS_API_KEY=你的密钥
NEWSDATA_API_KEY=你的密钥
```

---

## 推荐配置

**最低配置**：至少配置 1 个 API（推荐 GNews 或 Currents）

**推荐配置**：配置 2-3 个 API，确保新闻来源多样

**最佳配置**：配置全部 4 个 API，获取最全面的新闻

---

## 验证配置

配置完成后：

1. 访问你的网站
2. 点击"刷新"按钮
3. 如果看到新闻列表，说明配置成功
4. 如果显示"未能获取到新闻数据"，说明需要检查 API 密钥

---

## 常见问题

### Q: 为什么不使用免费爬虫抓取？

**A:** 
- 网站的 CORS 限制导致浏览器无法直接抓取
- RSS 源经常不稳定或不可用
- 官方 API 更稳定、更可靠

### Q: 免费额度够用吗？

**A:** 
- 个人使用完全够用
- Currents + NewsData = 每天 400 个请求
- 每次刷新消耗 1 个请求
- 足够支持每天数十次刷新

### Q: 可以只用一个 API 吗？

**A:** 
- 可以，但建议配置 2-3 个
- 单一 API 可能出现故障
- 多个 API 可以获取更多样的新闻

---

## 新闻来源

本项目从以下权威来源获取新闻：

### API 来源
- GNews 聚合的全球新闻
- NewsAPI 聚合的中文财经新闻
- Currents API 的实时财经新闻
- NewsData.io 的中国财经新闻

### 直接抓取（通过 Jina.ai Reader）
- 新浪财经
- 东方财富
- 财联社

所有新闻都是真实的，无任何模拟数据。
