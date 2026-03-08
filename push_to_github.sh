#!/bin/bash

echo "================================"
echo "  推送代码到 GitHub"
echo "================================"
echo ""
echo "请先在 GitHub 创建仓库：https://github.com/new"
echo "仓库名: financial-advisor-news"
echo ""
echo "创建完成后，请输入你的 GitHub 用户名："
read username

if [ -z "$username" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

echo ""
echo "正在添加远程仓库..."
git remote add origin https://github.com/${username}/financial-advisor-news.git

echo "正在推送代码..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "GitHub 仓库地址："
    echo "https://github.com/${username}/financial-advisor-news"
    echo ""
    echo "下一步：访问 https://vercel.com 进行部署"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "1. GitHub 用户名是否正确"
    echo "2. 仓库是否已创建"
    echo "3. 网络连接是否正常"
fi
