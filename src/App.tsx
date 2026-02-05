import { useState } from 'react'
import { DropZone } from './components/DropZone'
import { LottiePreview } from './components/LottiePreview'
import { ConvertPanel } from './components/ConvertPanel'
import type { LottieData } from './utils/lottieHelper'

function App() {
  const [lottieData, setLottieData] = useState<LottieData | null>(null)

  const handleReset = () => {
    setLottieData(null)
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Lottie to APNG</h1>
        <p className="header__subtitle">将 Lottie 动画转换为 APNG 格式</p>
      </header>

      <main className="main">
        {!lottieData ? (
          <DropZone onLoad={setLottieData} />
        ) : (
          <div className="workspace">
            <LottiePreview data={lottieData} />
            <ConvertPanel data={lottieData} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>纯前端转换，文件不会上传到服务器</p>
        <p className="footer__author">by 炭酸</p>
      </footer>
    </div>
  )
}

export default App
