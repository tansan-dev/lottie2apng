import { useEffect, useRef, useState, useCallback } from 'react'
import lottie, { AnimationItem } from 'lottie-web'
import type { LottieData } from '../utils/lottieHelper'

interface UseLottieOptions {
  data: LottieData | null
}

export function useLottie({ data }: UseLottieOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!containerRef.current || !data) return

    // 先设置容器尺寸，再加载动画
    containerRef.current.style.width = `${data.w}px`
    containerRef.current.style.height = `${data.h}px`

    if (animationRef.current) {
      animationRef.current.destroy()
    }

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'canvas',
      loop: true,
      autoplay: true,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        clearCanvas: true
      }
    })

    animationRef.current = animation
    setIsPlaying(true)

    return () => {
      animation.destroy()
      animationRef.current = null
    }
  }, [data])

  const togglePlay = useCallback(() => {
    if (!animationRef.current) return

    if (isPlaying) {
      animationRef.current.pause()
    } else {
      animationRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  return {
    containerRef,
    animationRef,
    isPlaying,
    togglePlay
  }
}
