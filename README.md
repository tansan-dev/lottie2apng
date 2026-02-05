# Lottie to APNG

纯前端 Lottie 动画转 APNG 工具。文件不会上传到服务器，所有转换在浏览器中完成。

## 功能

- 拖拽或点击上传 Lottie JSON 文件
- 实时预览动画效果
- 输出分辨率：1x / 2x / 3x / 4x
- 压缩质量：无损 / 高质量(256色) / 中等(128色) / 小文件(64色)
- 帧率调整：原始 / 60 / 30 / 24 / 15 / 12 fps
- 自动去除重复帧，减小文件体积

## 使用

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build

# 部署到 Cloudflare Pages
npm run deploy
```

## 技术实现

```
Lottie JSON → lottie-web 渲染到 canvas → 逐帧截取像素数据 → UPNG.js 编码 → APNG 文件
```

核心流程：

1. 使用 `lottie-web` 的 canvas 渲染器加载动画
2. 通过 `goToAndStop()` 定位到每一帧，从 canvas 获取像素数据
3. 比较相邻帧，相同帧合并延迟时间而非重复存储
4. 在 Web Worker 中使用 `UPNG.js` 编码为 APNG，避免阻塞主线程

高分辨率输出通过设置 `dpr`（设备像素比）实现，让 lottie-web 直接以目标分辨率渲染，避免缩放产生的锯齿。

## 依赖

- [lottie-web](https://github.com/airbnb/lottie-web) - Lottie 动画渲染
- [UPNG.js](https://github.com/nickyout/upng-js) - PNG/APNG 编码
- React + Vite + TypeScript

## 部署

项目配置了 Cloudflare Pages 部署。`wrangler.toml` 中指定了项目名称，执行 `npm run deploy` 即可部署。
