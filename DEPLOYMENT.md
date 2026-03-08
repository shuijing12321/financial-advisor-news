# 部署指南

## 🚀 部署到 Vercel（推荐）

### 方法一：网页一键部署（最简单）

1. **访问 Vercel 官网**
   - 打开：https://vercel.com
   - 点击 "Sign Up" 注册（可用 GitHub 账号）

2. **导入项目**
   - 登录后点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 将当前项目推送到 GitHub，然后选择该仓库

3. **配置项目**
   - Framework Preset: Next.js（自动检测）
   - Root Directory: `financial-advisor-news`
   - 构建命令：`npm run build`（默认）
   - 输出目录：`.next`（默认）

4. **点击 Deploy**
   - 等待 2-3 分钟自动部署
   - 部署成功后会获得一个 `.vercel.app` 域名

### 方法二：命令行部署

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
cd /Users/susieyao/CodeBuddy/20260227164336/financial-advisor-news
vercel

# 4. 部署到生产环境
vercel --prod
```

### 方法三：GitHub 自动部署

1. **推送代码到 GitHub**
```bash
cd /Users/susieyao/CodeBuddy/20260227164336/financial-advisor-news
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/项目名.git
git push -u origin main
```

2. **连接 Vercel**
   - 在 Vercel 中导入 GitHub 仓库
   - 每次推送到 main 分支会自动部署

## 📋 环境变量配置（可选）

如果有新闻 API Key，可以在 Vercel 控制台配置：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：

```
GNEWS_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
CURRENTS_API_KEY=your_key_here
```

## 🌐 部署后效果

- ✅ 新闻可以正常抓取（服务器端无 CORS 限制）
- ✅ 所有功能正常工作
- ✅ 自动 HTTPS 证书
- ✅ 全球 CDN 加速
- ✅ 每次推送自动部署

## 🎯 部署成功后

访问你的 `.vercel.app` 域名，应该可以看到：
- 实时抓取的热点新闻
- 热点词云正常显示
- AI 素材生成功能正常
- 所有交互功能正常

## 💰 费用说明

**Vercel 免费套餐：**
- ✅ 100GB 带宽/月
- ✅ 无限次部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 适合个人项目

## 📝 常见问题

### Q: 部署后看不到新闻？
A: 检查 Vercel 的 Functions 日志，查看是否有错误信息

### Q: 如何查看日志？
A: Vercel 控制台 → 项目 → Deployments → 点击部署 → Functions

### Q: 如何绑定自定义域名？
A: Vercel 控制台 → 项目 Settings → Domains → Add Domain

### Q: 如何回滚到之前的版本？
A: Vercel 控制台 → Deployments → 选择历史版本 → Promote to Production

---

**推荐使用方法一（网页部署），最简单快捷！**
