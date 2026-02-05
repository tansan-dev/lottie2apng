import lottie from 'lottie-web'
import type { LottieData } from './lottieHelper'

export type ScaleFactor = 1 | 2 | 3 | 4

// 压缩质量：cnum 值越小，文件越小，但颜色数量越少
export type CompressionQuality = 'lossless' | 'high' | 'medium' | 'low'

// 帧率选项：0 表示使用原始帧率
export type FrameRateOption = 0 | 60 | 30 | 24 | 15 | 12

export const COMPRESSION_CONFIG: Record<CompressionQuality, { cnum: number; label: string; description: string }> = {
  lossless: { cnum: 0, label: '无损', description: '最高质量，文件最大' },
  high: { cnum: 256, label: '高质量', description: '256 色，几乎无损' },
  medium: { cnum: 128, label: '中等', description: '128 色，平衡质量和大小' },
  low: { cnum: 64, label: '小文件', description: '64 色，文件最小' }
}

export const FRAMERATE_CONFIG: Record<FrameRateOption, { label: string; description: string }> = {
  0: { label: '原始', description: '保持原始帧率' },
  60: { label: '60', description: '60 fps，最流畅' },
  30: { label: '30', description: '30 fps，流畅' },
  24: { label: '24', description: '24 fps，电影感' },
  15: { label: '15', description: '15 fps，较小文件' },
  12: { label: '12', description: '12 fps，最小文件' }
}

// 比较两帧是否相同
function areFramesEqual(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false
  // 采样比较以提高性能（每隔 100 个像素比较一次）
  for (let i = 0; i < a.length; i += 400) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) {
      return false
    }
  }
  // 如果采样相同，再完整比较
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

interface ConvertOptions {
  data: LottieData
  scale?: ScaleFactor
  compression?: CompressionQuality
  targetFrameRate?: FrameRateOption
  onProgress: (progress: number, stage: string) => void
}

export async function convertToApng({
  data,
  scale = 1,
  compression = 'lossless',
  targetFrameRate = 0,
  onProgress
}: ConvertOptions): Promise<Blob> {
  const width = Math.round(data.w)
  const height = Math.round(data.h)
  const outputWidth = width * scale
  const outputHeight = height * scale

  // 创建离屏容器
  const container = document.createElement('div')
  container.style.width = `${width}px`
  container.style.height = `${height}px`
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  const animation = lottie.loadAnimation({
    container,
    renderer: 'canvas',
    loop: false,
    autoplay: false,
    animationData: data,
    rendererSettings: {
      // 使用 scale 作为设备像素比，让 Lottie 直接以高分辨率渲染
      // 这样可以避免后期缩放导致的锯齿
      dpr: scale
    }
  })

  await new Promise<void>((resolve) => {
    animation.addEventListener('DOMLoaded', () => resolve())
  })

  // Lottie 原始参数
  const originalFrameRate = data.fr
  const startFrame = data.ip
  const endFrame = data.op
  const totalSourceFrames = Math.floor(endFrame - startFrame)

  // 计算目标帧率和抽帧参数
  const outputFrameRate = targetFrameRate === 0 ? originalFrameRate : Math.min(targetFrameRate, originalFrameRate)
  const frameStep = originalFrameRate / outputFrameRate // 每隔多少源帧取一帧
  const outputFrameDelay = Math.round(1000 / outputFrameRate)
  const totalOutputFrames = Math.ceil(totalSourceFrames / frameStep)

  // 调试信息
  console.log('[lottie2apng] 原始帧率:', originalFrameRate, 'fps, 输出帧率:', outputFrameRate, 'fps')
  console.log('[lottie2apng] 源帧数:', totalSourceFrames, ', 输出帧数:', totalOutputFrames, ', 帧步长:', frameStep.toFixed(2))

  // 获取 lottie 创建的 canvas
  // 由于设置了 dpr，Lottie canvas 已经是目标分辨率，无需再缩放
  const lottieCanvas = container.querySelector('canvas') as HTMLCanvasElement | null
  if (!lottieCanvas) {
    throw new Error('无法获取 Lottie canvas')
  }

  // 直接使用 lottie canvas 的 2d context 获取像素数据
  const lottieCtx = lottieCanvas.getContext('2d')!

  // 验证 canvas 尺寸
  console.log('[lottie2apng] Lottie canvas 尺寸:', lottieCanvas.width, 'x', lottieCanvas.height, ', 目标尺寸:', outputWidth, 'x', outputHeight)

  const frames: ArrayBuffer[] = []
  const delays: number[] = []
  let lastFrameData: Uint8ClampedArray | null = null
  let duplicateCount = 0

  onProgress(0, '提取帧')

  for (let i = 0; i < totalOutputFrames; i++) {
    // 计算实际要提取的源帧索引
    const sourceFrameIndex = Math.min(Math.floor(i * frameStep), totalSourceFrames - 1)

    // 使用帧索引直接定位（lottie-web 的帧索引从 0 开始）
    animation.goToAndStop(sourceFrameIndex, true)

    // 直接从 lottie canvas 获取像素数据（已经是目标分辨率）
    const imageData = lottieCtx.getImageData(0, 0, outputWidth, outputHeight)

    // 检测是否与上一帧相同
    if (lastFrameData && areFramesEqual(lastFrameData, imageData.data)) {
      // 相同帧：增加上一帧的延迟时间
      delays[delays.length - 1] += outputFrameDelay
      duplicateCount++
    } else {
      // 不同帧：添加新帧
      frames.push(imageData.data.buffer.slice(0))
      delays.push(outputFrameDelay)
      lastFrameData = new Uint8ClampedArray(imageData.data)
    }

    // 每帧都更新进度，提取帧占 0-20%
    onProgress((i / totalOutputFrames) * 20, '提取帧')
    // 让出主线程
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  console.log('[lottie2apng] 去重后帧数:', frames.length, ', 去除重复帧:', duplicateCount)

  animation.destroy()
  document.body.removeChild(container)

  onProgress(20, '编码 APNG')

  // 模拟进度：编码期间从 20% 缓慢增长到 90%
  let simulatedProgress = 20
  const progressInterval = setInterval(() => {
    // 非常缓慢的增长，每秒约增长 2-3%
    simulatedProgress += (90 - simulatedProgress) * 0.015
    onProgress(simulatedProgress, '编码 APNG')
  }, 150)

  const cnum = COMPRESSION_CONFIG[compression].cnum
  const apngBuffer = await encodeApng(frames, outputWidth, outputHeight, delays, cnum)

  clearInterval(progressInterval)
  onProgress(100, '完成')

  return new Blob([apngBuffer], { type: 'image/png' })
}

function encodeApng(
  frames: ArrayBuffer[],
  width: number,
  height: number,
  delays: number[],
  cnum: number
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/encoder.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e) => {
      if (e.data.type === 'complete') {
        resolve(e.data.data)
        worker.terminate()
      } else if (e.data.type === 'error') {
        reject(new Error(e.data.message))
        worker.terminate()
      }
    }

    worker.onerror = (e) => {
      reject(new Error(e.message))
      worker.terminate()
    }

    const transferableFrames = frames.map((f) => f)
    worker.postMessage(
      { type: 'encode', frames: transferableFrames, width, height, delays, cnum },
      { transfer: transferableFrames }
    )
  })
}
