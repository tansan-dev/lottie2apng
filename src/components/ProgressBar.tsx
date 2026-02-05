interface ProgressBarProps {
  progress: number
  stage: string
}

export function ProgressBar({ progress, stage }: ProgressBarProps) {
  return (
    <div className="progress">
      <div className="progress__bar">
        <div
          className="progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress__info">
        <span className="progress__stage">{stage}</span>
        <span className="progress__percent">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
