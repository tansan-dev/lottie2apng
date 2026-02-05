import { useLottie } from '../hooks/useLottie'
import { getLottieInfo, type LottieData } from '../utils/lottieHelper'

interface LottiePreviewProps {
  data: LottieData
}

export function LottiePreview({ data }: LottiePreviewProps) {
  const { containerRef, isPlaying, togglePlay } = useLottie({ data })
  const info = getLottieInfo(data)

  return (
    <div className="preview">
      <div className="preview__canvas-wrapper">
        <div ref={containerRef} className="preview__canvas" />
      </div>

      <div className="preview__info">
        <div className="preview__info-row">
          <span className="preview__label">尺寸</span>
          <span className="preview__value">{info.width} × {info.height}</span>
        </div>
        <div className="preview__info-row">
          <span className="preview__label">帧率</span>
          <span className="preview__value">{info.frameRate} fps</span>
        </div>
        <div className="preview__info-row">
          <span className="preview__label">帧数</span>
          <span className="preview__value">{info.totalFrames}</span>
        </div>
        <div className="preview__info-row">
          <span className="preview__label">时长</span>
          <span className="preview__value">{info.duration.toFixed(2)}s</span>
        </div>
      </div>

      <button className="preview__play-btn" onClick={togglePlay}>
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
        {isPlaying ? '暂停' : '播放'}
      </button>
    </div>
  )
}
