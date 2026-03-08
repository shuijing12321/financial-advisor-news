# 📝 部署操作步骤（请按顺序执行）

## 第一步：创建 GitHub 仓库

### 1.1 打开浏览器，访问：
```
https://github.com/new
```

### 1.2 填写信息：
```
Repository name: financial-advisor-news
Description: 金融投顾素材助手
Visibility: 选择 Public（公开）

⚠️ 不要勾选任何选项：
[ ] Add a README file
[ ] Add .gitignore  
[ ] Choose a license
```

### 1.3 点击绿色按钮 "Create repository"

---

## 第二步：推送代码到 GitHub

### 2.1 复制你的 GitHub 用户名

你的 GitHub 用户名是：`________________` （请填写）

### 2.2 在终端执行以下命令

**替换下面的 `YOUR_USERNAME` 为你的 GitHub 用户名，然后复制执行：**

```bash
cd /Users/susieyao/CodeBuddy/20260227164336/financial-advisor-news

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/financial-advisor-news.git

# 推送代码
git branch -M main
git push -u origin main
```

### 2.3 如果提示输入密码

GitHub 现在需要使用 Personal Access Token：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token
5. 在终端输入密码时，粘贴 token（不会显示，直接粘贴后回车）

---

## 第三步：部署到 Vercel

### 3.1 访问 Vercel
```
https://vercel.com
```

### 3.2 登录
```
点击 "Sign Up" 或 "Log In"
选择 "Continue with GitHub"
授权 Vercel 访问你的 GitHub
```

### 3.3 导入项目
```
登录后，点击右上角 "Add New..."
选择 "Project"

在 "Import Git Repository" 部分
找到 "financial-advisor-news" 仓库
点击 "Import"
```

### 3.4 配置项目（自动检测，无需修改）
```
Framework Preset: Next.js (自动检测)
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install

⚠️ 保持默认即可，不要修改
```

### 3.5 开始部署
```
点击底部大大的蓝色按钮 "Deploy"

等待 2-3 分钟...

会看到构建日志滚动：
✓ Installing dependencies...
✓ Building...
✓ Deploying...
```

### 3.6 部署成功
```
看到 🎉 庆祝动画
显示 "Congratulations!"

点击 "Continue to Dashboard"
```

---

## 第四步：访问你的网站

### 4.1 在 Vercel 控制台
```
找到 "Domains" 部分
会显示你的免费域名：
https://financial-advisor-news-xxx.vercel.app

点击域名即可访问！
```

### 4.2 验证功能
```
✅ 首页是否显示新闻？
✅ 热点词云是否显示？
✅ 点击新闻能否生成素材？
✅ 搜索和筛选是否正常？
```

---

## 🎯 预期效果

部署成功后，你会看到：

1. **实时新闻**
   - 百度热搜
   - 知乎热榜
   - 微博热搜
   - 36氪等

2. **热点词云**
   - 自动生成
   - 可点击筛选

3. **AI 素材生成**
   - 完整功能
   - 可保存管理

4. **免费域名**
   - 可以分享给任何人
   - 24小时在线

---

## ⚠️ 常见问题

### Q1: 推送代码时提示 "remote origin already exists"
**解决：**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/financial-advisor-news.git
git push -u origin main
```

### Q2: 推送时提示需要密码
**解决：**
使用 Personal Access Token，详见上方 "2.3 如果提示输入密码"

### Q3: Vercel 找不到仓库
**解决：**
- 确保仓库是 Public（公开）
- 在 Vercel 设置中授权访问该仓库

### Q4: 部署失败
**解决：**
- 查看构建日志中的错误信息
- 通常是因为依赖安装失败，重新部署即可

---

## 📞 需要帮助？

如果遇到问题，请告诉我：
1. 在哪一步卡住了
2. 看到什么错误信息
3. 我会帮你解决

---

**现在开始第一步：创建 GitHub 仓库吧！**
