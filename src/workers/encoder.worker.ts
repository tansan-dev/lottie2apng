import UPNG from 'upng-js'

interface EncodeMessage {
  type: 'encode'
  frames: ArrayBuffer[]
  width: number
  height: number
  delays: number[]
  cnum: number
}

self.onmessage = (e: MessageEvent<EncodeMessage>) => {
  if (e.data.type === 'encode') {
    const { frames, width, height, delays, cnum } = e.data

    try {
      const apng = UPNG.encode(frames, width, height, cnum, delays)

      self.postMessage(
        { type: 'complete', data: apng },
        { transfer: [apng] }
      )
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Encoding failed'
      })
    }
  }
}
