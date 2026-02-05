import { useState, useCallback } from 'react'
import { convertToApng, type ScaleFactor, type CompressionQuality, type FrameRateOption } from '../utils/converter'
import type { LottieData } from '../utils/lottieHelper'

interface ConvertState {
  status: 'idle' | 'converting' | 'done' | 'error'
  progress: number
  stage: string
  blob: Blob | null
  error: string | null
}

export function useConverter() {
  const [state, setState] = useState<ConvertState>({
    status: 'idle',
    progress: 0,
    stage: '',
    blob: null,
    error: null
  })

  const convert = useCallback(async (data: LottieData, scale: ScaleFactor = 1, compression: CompressionQuality = 'lossless', targetFrameRate: FrameRateOption = 0) => {
    setState({
      status: 'converting',
      progress: 0,
      stage: '准备中',
      blob: null,
      error: null
    })

    try {
      const blob = await convertToApng({
        data,
        scale,
        compression,
        targetFrameRate,
        onProgress: (progress, stage) => {
          setState((prev) => ({ ...prev, progress, stage }))
        }
      })

      setState({
        status: 'done',
        progress: 100,
        stage: '完成',
        blob,
        error: null
      })
    } catch (err) {
      setState({
        status: 'error',
        progress: 0,
        stage: '',
        blob: null,
        error: err instanceof Error ? err.message : '转换失败'
      })
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      stage: '',
      blob: null,
      error: null
    })
  }, [])

  return { state, convert, reset }
}
