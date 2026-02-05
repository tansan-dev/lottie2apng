# Lottie 转 APNG 方案

## 转换流程

### 1. 预处理 Lottie 文件

Lottie JSON 文件中的 `w`（宽度）和 `h`（高度）可能是小数，需要修复为整数，否则渲染工具会报错。

```bash
# 示例：将 407.39 -> 408, 322.5 -> 323
sed 's/"h":322.5/"h":323/g; s/"w":407.39/"w":408/g' input.json > fixed.json
```

### 2. 导出帧序列

使用 `puppeteer-lottie-cli` 将 Lottie 动画逐帧渲染为 PNG 图片。

```bash
# 安装
npm install -g puppeteer-lottie-cli

# 导出帧序列（60fps，168 帧）
puppeteer-lottie -i fixed.json -o 'frames/frame-%03d.png'
```

输出：`frame-001.png`, `frame-002.png`, ... `frame-168.png`

### 3. 合成 APNG

使用 `ffmpeg` 将帧序列合成为 APNG 动画。

```bash
ffmpeg -framerate 60 -i frames/frame-%03d.png -f apng -plays 0 output.png
```

参数说明：
- `-framerate 60`：帧率 60fps
- `-f apng`：指定输出格式为 APNG
- `-plays 0`：无限循环播放

### 依赖

- Node.js
- puppeteer-lottie-cli（npm 包）
- ffmpeg

## Web 应用实现思路

在浏览器中实现相同流程：

1. **渲染**：使用 `lottie-web` 加载并渲染动画到 canvas
2. **截帧**：遍历每一帧，调用 `canvas.toDataURL('image/png')` 获取 PNG 数据
3. **合成**：使用 `UPNG.js` 将帧序列合成 APNG
4. **下载**：生成 Blob 并触发下载

```
用户上传 .json → lottie-web 渲染 → canvas 逐帧截图 → UPNG.js 合成 → 下载 .png
```
