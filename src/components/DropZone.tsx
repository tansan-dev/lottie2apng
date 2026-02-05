import { useCallback, useState, useRef } from 'react'
import { validateLottie, preprocessLottie, type LottieData } from '../utils/lottieHelper'

interface DropZoneProps {
  onLoad: (data: LottieData) => void
}

export function DropZone({ onLoad }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)

    if (!file.name.endsWith('.json')) {
      setError('请上传 JSON 文件')
      return
    }

    // 提取文件名（不含扩展名）
    const sourceFileName = file.name.replace(/\.json$/i, '')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        if (!validateLottie(data)) {
          setError('无效的 Lottie JSON 文件')
          return
        }

        const processed = preprocessLottie(data)
        processed._sourceFileName = sourceFileName
        onLoad(processed)
      } catch {
        setError('JSON 解析失败')
      }
    }
    reader.onerror = () => setError('文件读取失败')
    reader.readAsText(file)
  }, [onLoad])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div
      className={`drop-zone ${isDragging ? 'drop-zone--active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="drop-zone__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p className="drop-zone__text">
        拖拽 Lottie JSON 文件到此处
      </p>
      <p className="drop-zone__hint">或点击选择文件</p>
      {error && <p className="drop-zone__error">{error}</p>}
    </div>
  )
}
