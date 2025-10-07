# 🚀 快速开始指南

本指南将帮助你在 5 分钟内完成 RunPod 应用的自动部署设置。

## 📋 前置条件检查

- [ ] GitHub 账号
- [ ] Docker Hub 账号
- [ ] RunPod 账号

## 🔧 一次性设置（5 分钟）

### 步骤 1: Fork 或克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/runpod-apps.git
cd runpod-apps
```

### 步骤 2: 获取 Docker Hub 访问令牌

1. 访问 https://hub.docker.com/settings/security
2. 点击 **New Access Token**
3. Token 描述：`runpod-github-actions`
4. 权限：选择 **Read & Write**
5. 点击 **Generate**
6. **复制令牌**（只显示一次）

### 步骤 3: 配置 GitHub Secrets

1. 在 GitHub 仓库页面，进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加两个 secrets：

   **Secret 1:**
   - Name: `DOCKER_USERNAME`
   - Secret: `你的 Docker Hub 用户名`

   **Secret 2:**
   - Name: `DOCKER_PASSWORD`
   - Secret: `刚才复制的 Docker Hub 访问令牌`

### 步骤 4: 测试部署

**选项 A: 自动触发（推荐）**
```bash
# 随便修改一个文件触发部署
echo "# Test" >> infinitetalk/README.md
git add .
git commit -m "Test CI/CD"
git push origin main
```

**选项 B: 手动触发**
1. 进入 GitHub 仓库的 **Actions** 标签
2. 选择 **Deploy RunPod Applications**
3. 点击 **Run workflow**
4. 选择 `all` 部署所有应用
5. 点击 **Run workflow**

### 步骤 5: 查看构建状态

1. 在 **Actions** 标签中，点击最新的 workflow run
2. 等待构建完成（约 10-30 分钟，取决于项目）
3. 查看部署摘要，获取 Docker 镜像名称

## 🎯 在 RunPod 创建 Endpoint

### 步骤 6: 创建 RunPod Template

1. 访问 https://www.runpod.io/console/serverless/user/templates
2. 点击 **+ New Template**

#### InfiniteTalk 配置
```
Template Name: infinitetalk-template
Container Image: YOUR_USERNAME/infinitetalk-runpod:latest
Container Disk: 50 GB
Environment Variables:
  - SERVER_ADDRESS=127.0.0.1
```

3. 点击 **Save Template**

### 步骤 7: 创建 Serverless Endpoint

1. 访问 https://www.runpod.io/console/serverless
2. 点击 **+ New Endpoint**
3. 选择刚创建的 Template
4. 配置：
   ```
   Endpoint Name: infinitetalk-prod
   Min Workers: 0 (按需启动)
   Max Workers: 3
   GPU Types: 选择支持的 GPU（如 RTX 3090, A40）
   Idle Timeout: 5 seconds
   Enable FlashBoot: ✓
   ```
5. 点击 **Deploy**

### 步骤 8: 测试 Endpoint

```bash
# 获取你的 endpoint ID 和 API key
export RUNPOD_ENDPOINT_ID="your-endpoint-id"
export RUNPOD_API_KEY="your-api-key"

# 测试 InfiniteTalk
curl -X POST "https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -d '{
    "input": {
      "input_type": "image",
      "person_count": "single",
      "prompt": "一个人正在说话",
      "image_url": "https://example.com/image.jpg",
      "wav_url": "https://example.com/audio.wav",
      "width": 512,
      "height": 512
    }
  }'
```

## 🔄 日常使用流程

### 更新代码并自动部署

```bash
# 1. 修改代码
cd infinitetalk
vim handler.py

# 2. 提交更改
git add .
git commit -m "Update handler logic"

# 3. 推送（自动触发 CI/CD）
git push origin main

# 4. GitHub Actions 会自动：
#    - 检测变更的项目
#    - 构建 Docker 镜像
#    - 推送到 Docker Hub
#    - 显示部署摘要

# 5. RunPod 会在下次调用时自动拉取新镜像（如果使用 :latest 标签）
```

### 手动更新 RunPod Endpoint

如果想立即使用新镜像：

1. 进入 RunPod Console
2. 找到你的 Endpoint
3. 点击 **Edit**
4. 点击 **Update** 强制拉取新镜像
5. 等待重新部署完成

## 🎓 进阶配置

### 使用特定版本标签

在 RunPod Template 中使用 commit SHA 标签而非 `latest`：

```
Container Image: YOUR_USERNAME/infinitetalk-runpod:abc1234
```

优点：
- ✅ 版本可追溯
- ✅ 可回滚到任意版本
- ✅ 避免意外更新

缺点：
- ❌ 每次更新需要手动修改 Template

### 配置 Network Volume

用于缓存模型权重，加快启动速度：

1. 创建 Network Volume:
   ```
   Name: model-cache
   Size: 100 GB
   Region: 选择与 endpoint 相同的区域
   ```

2. 在 Endpoint 设置中连接 Volume:
   ```
   Network Volume: model-cache
   Mount Path: /runpod-volume
   ```

3. 修改代码使用 Volume 缓存模型

### 设置 Webhook 通知

在 GitHub 仓库设置中添加 Webhook，部署完成后通知到 Slack/Discord：

1. Settings → Webhooks → Add webhook
2. Payload URL: 你的通知服务 URL
3. Content type: application/json
4. Events: Workflow runs

## ❓ 常见问题

### Q: GitHub Actions 失败
**A:** 检查：
- Docker Hub credentials 是否正确
- 网络连接是否正常
- 查看 Actions 日志获取详细错误

### Q: RunPod 拉取镜像失败
**A:**
- 确认镜像在 Docker Hub 上是 Public
- 或在 RunPod 中配置 Docker credentials

### Q: Endpoint 启动慢
**A:**
- 启用 FlashBoot
- 使用 Network Volume 缓存模型
- 考虑设置 Min Workers > 0

### Q: 如何回滚到之前的版本
**A:**
```bash
# 1. 在 GitHub Actions 历史中找到之前的 commit SHA
# 2. 更新 RunPod Template 镜像标签：
YOUR_USERNAME/infinitetalk-runpod:old-commit-sha
# 3. 重启 Endpoint
```

## 📚 下一步

- [ ] 阅读完整 [README.md](./README.md)
- [ ] 查看各项目的详细文档
- [ ] 配置监控和日志
- [ ] 设置成本预警

## 🆘 获取帮助

- GitHub Issues: https://github.com/YOUR_REPO/issues
- RunPod Discord: https://discord.gg/runpod
- RunPod Docs: https://docs.runpod.io/

---

**🎉 恭喜！你已经完成了 RunPod 应用的自动化部署设置！**
