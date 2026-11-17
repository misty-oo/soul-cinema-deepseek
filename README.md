# SOUL CINEMA · DeepSeek 版

暗黑奢华、未来电影感的电影人格解码器。使用 Next.js App Router，AI 请求仅在服务端执行。

## 部署到 Vercel

1. 将本项目 ZIP 解压。
2. 在 Vercel 中创建/导入项目，上传项目文件夹（或使用 Vercel 支持的 ZIP 导入流程）。
3. 在 Vercel 项目 Settings → Environment Variables 添加：
   - Name: `DEEPSEEK_API_KEY`
   - Value: 你的 DeepSeek API Key
   - Environment: Production（建议同时勾选 Preview）
4. 重新部署最新 Deployment。
5. 打开网站，提交一份测试报告。

## 本地运行

```bash
npm install
```

创建 `.env.local`：

```env
DEEPSEEK_API_KEY=你的DeepSeek密钥
```

然后运行：

```bash
npm run dev
```

## 安全说明

- API Key 只读取服务端环境变量，不会发送到浏览器。
- 不要将 API Key 写入源码、提交到 Git，或截图分享。
- API 调用会产生 DeepSeek 平台费用，具体以平台账户及价格页面为准。
- 当前版本没有用户登录、限流或持久化存储。公开上线后建议增加请求频率限制和预算监控。
