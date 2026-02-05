import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { useConverter } from '../hooks/useConverter'
import { downloadBlob } from '../utils/download'
import type { LottieData } from '../utils/lottieHelper'
import type { ScaleFactor, CompressionQuality, FrameRateOption } from '../utils/converter'
import { COMPRESSION_CONFIG, FRAMERATE_CONFIG } from '../utils/converter'

interface ConvertPanelProps {
  data: LottieData
  onReset: () => void
}

const SCALE_OPTIONS: ScaleFactor[] = [1, 2, 3, 4]
const COMPRESSION_OPTIONS: CompressionQuality[] = ['lossless', 'high', 'medium', 'low']
const FRAMERATE_OPTIONS: FrameRateOption[] = [0, 60, 30, 24, 15, 12]

export function ConvertPanel({ data, onReset }: ConvertPanelProps) {
  const { state, convert, reset } = useConverter()
  const [scale, setScale] = useState<ScaleFactor>(1)
  const [compression, setCompression] = useState<CompressionQuality>('high')
  const [frameRate, setFrameRate] = useState<FrameRateOption>(0)

  const handleConvert = () => {
    convert(data, scale, compression, frameRate)
  }

  // 获取帧率描述，如果选择原始则显示实际帧率
  const getFrameRateDescription = () => {
    if (frameRate === 0) {
      return `保持原始帧率 (${data.fr} fps)`
    }
    return FRAMERATE_CONFIG[frameRate].description
  }

  const outputWidth = Math.round(data.w * scale)
  const outputHeight = Math.round(data.h * scale)

  const handleDownload = () => {
    if (state.blob) {
      const baseName = data._sourceFileName || data.nm || 'animation'
      const fpsValue = frameRate === 0 ? Math.round(data.fr) : frameRate
      const filename = `${baseName}_${scale}x_${compression}_${fpsValue}fps.png`
      downloadBlob(state.blob, filename)
    }
  }

  const handleReset = () => {
    reset()
    onReset()
  }

  return (
    <div className="convert-panel">
      {state.status === 'converting' && (
        <ProgressBar progress={state.progress} stage={state.stage} />
      )}

      {state.status === 'error' && (
        <p className="convert-panel__error">{state.error}</p>
      )}

      <div className="convert-panel__section">
        <label className="convert-panel__label">输出倍数</label>
        <div className="convert-panel__scale-options">
          {SCALE_OPTIONS.map((s) => (
            <button
              key={s}
              className={`convert-panel__scale-btn ${scale === s ? 'convert-panel__scale-btn--active' : ''}`}
              onClick={() => setScale(s)}
              disabled={state.status === 'converting'}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="convert-panel__output-size">
          输出尺寸: {outputWidth} × {outputHeight}
        </div>
      </div>

      <div className="convert-panel__section">
        <label className="convert-panel__label">压缩质量</label>
        <div className="convert-panel__compression-options">
          {COMPRESSION_OPTIONS.map((c) => (
            <button
              key={c}
              className={`convert-panel__compression-btn ${compression === c ? 'convert-panel__compression-btn--active' : ''}`}
              onClick={() => setCompression(c)}
              disabled={state.status === 'converting'}
              title={COMPRESSION_CONFIG[c].description}
            >
              {COMPRESSION_CONFIG[c].label}
            </button>
          ))}
        </div>
        <div className="convert-panel__compression-hint">
          {COMPRESSION_CONFIG[compression].description}
        </div>
      </div>

      <div className="convert-panel__section">
        <label className="convert-panel__label">帧率</label>
        <div className="convert-panel__framerate-options">
          {FRAMERATE_OPTIONS.map((f) => (
            <button
              key={f}
              className={`convert-panel__framerate-btn ${frameRate === f ? 'convert-panel__framerate-btn--active' : ''}`}
              onClick={() => setFrameRate(f)}
              disabled={state.status === 'converting'}
              title={f === 0 ? `原始 (${data.fr} fps)` : FRAMERATE_CONFIG[f].description}
            >
              {f === 0 ? '原始' : f}
            </button>
          ))}
        </div>
        <div className="convert-panel__framerate-hint">
          {getFrameRateDescription()}
        </div>
      </div>

      <div className="convert-panel__actions">
        {state.status === 'idle' && (
          <button className="btn btn--primary" onClick={handleConvert}>
            转换为 APNG
          </button>
        )}

        {state.status === 'converting' && (
          <button className="btn btn--primary" disabled>
            转换中...
          </button>
        )}

        {state.status === 'done' && (
          <>
            <button className="btn btn--primary" onClick={handleDownload}>
              下载 APNG
            </button>
            <button className="btn btn--secondary" onClick={handleConvert}>
              重新转换
            </button>
          </>
        )}

        {state.status === 'error' && (
          <button className="btn btn--primary" onClick={handleConvert}>
            重试
          </button>
        )}

        <button className="btn btn--ghost" onClick={handleReset}>
          选择其他文件
        </button>
      </div>
    </div>
  )
}
