export interface LottieData {
  v: string
  fr: number
  ip: number
  op: number
  w: number
  h: number
  nm?: string
  ddd?: number
  assets?: unknown[]
  layers?: unknown[]
  _sourceFileName?: string // 源文件名（不含扩展名）
  [key: string]: unknown
}

export function validateLottie(data: unknown): data is LottieData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.v === 'string' &&
    typeof obj.fr === 'number' &&
    typeof obj.ip === 'number' &&
    typeof obj.op === 'number' &&
    typeof obj.w === 'number' &&
    typeof obj.h === 'number'
  )
}

export function preprocessLottie(data: LottieData): LottieData {
  return {
    ...data,
    w: Math.round(data.w),
    h: Math.round(data.h)
  }
}

export function getLottieInfo(data: LottieData) {
  const totalFrames = data.op - data.ip
  const duration = totalFrames / data.fr
  return {
    width: data.w,
    height: data.h,
    frameRate: data.fr,
    totalFrames,
    duration,
    name: data.nm || 'Untitled'
  }
}
