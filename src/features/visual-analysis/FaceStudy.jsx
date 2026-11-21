import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Camera, ImagePlus, RotateCcw, ScanFace, Trash2, X } from 'lucide-react'
import { prepareFacePhoto, reconstructFace } from './reconstructionApi'
import { faceAnnotations } from './faceAnnotations'
import { describeFaceContour } from './faceFeatures'
import { thirdsSummary } from './faceThirds'
import FaceFeatureReport from './FaceFeatureReport'
import './FaceStudy.css'

const FaceStudyViewer = lazy(() => import('./FaceStudyViewer'))
const comparison = import.meta.env.DEV && import.meta.env.VITE_FACE_COMPARISON !== '0'

export default function FaceStudy({ onBack, onOpenProduct }) {
  const [consented, setConsented] = useState(false)
  const [available, setAvailable] = useState(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [overrides, setOverrides] = useState({})
  const [showPhoto, setShowPhoto] = useState(false)
  const [engine, setEngine] = useState('3DDFA_V2')
  const [decaAvailable, setDecaAvailable] = useState(null)
  const photoRef = useRef(null), resultsRef = useRef({})
  const videoRef = useRef(null), streamRef = useRef(null), previewRef = useRef('')
  const sequenceRef = useRef(0), controllerRef = useRef(null), timerRef = useRef(null)
  const annotations = useMemo(() => result ? faceAnnotations(result, { overrides }) : [], [result, overrides])

  const thirdsStatus = thirdsSummary(result, overrides.thirds === 'skip')
  function resetInterpretation() { setOverrides({}) }
  function correctFeature(id, choice) {
    setOverrides((previous) => {
      const next = { ...previous }
      if (choice === 'auto') delete next[id]
      else next[id] = choice
      return next
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/face-reconstruction/status', { signal: controller.signal, cache: 'no-store' })
      .then((r) => r.json()).then((data) => setAvailable(Boolean(data.ok && data.available)))
      .catch(() => { if (!controller.signal.aborted) setAvailable(false) })
    if (comparison) fetch('/api/face-reconstruction/deca/status', { signal: controller.signal, cache: 'no-store' })
      .then((r) => r.json()).then((data) => setDecaAvailable(Boolean(data.ok && data.available)))
      .catch(() => { if (!controller.signal.aborted) setDecaAvailable(false) })
    return () => controller.abort()
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }
  function clearPhoto() {
    sequenceRef.current++
    controllerRef.current?.abort()
    controllerRef.current = null
    clearTimeout(timerRef.current)
    stopCamera()
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = ''
    photoRef.current = null; resultsRef.current = {}
    resetInterpretation()
    setPreview(''); setResult(null); setPhase('idle'); setError(''); setShowPhoto(false)
  }
  useEffect(() => { if (cameraOpen && videoRef.current) videoRef.current.srcObject = streamRef.current }, [cameraOpen])
  useEffect(() => () => {
    sequenceRef.current++
    controllerRef.current?.abort()
    clearTimeout(timerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    photoRef.current = null; resultsRef.current = {}
  }, [])

  async function selectFile(file) {
    if (!consented || !(engine === 'DECA' ? decaAvailable : available)) return
    clearPhoto()
    const sequence = sequenceRef.current
    const controller = new AbortController()
    controllerRef.current = controller
    setPhase('loading')
    try {
      const blob = await prepareFacePhoto(file)
      if (sequence !== sequenceRef.current) return
      previewRef.current = URL.createObjectURL(blob)
      photoRef.current = blob
      setPreview(previewRef.current)
      const next = await reconstructFace(blob, controller.signal, engine)
      if (sequence !== sequenceRef.current) return
      resultsRef.current[engine] = next
      setResult(next); setPhase('building')
    } catch (cause) {
      if (sequence !== sequenceRef.current || controller.signal.aborted) return
      setError(cause.message || '重建失败，请重试。'); setPhase('error')
    }
  }
  async function switchEngine(nextEngine) {
    if (nextEngine === engine) return
    resetInterpretation()
    setEngine(nextEngine); setError(''); setShowPhoto(false)
    clearTimeout(timerRef.current)
    if (!photoRef.current) return
    const sequence = ++sequenceRef.current
    controllerRef.current?.abort()
    if (resultsRef.current[nextEngine]) {
      setResult(resultsRef.current[nextEngine]); setPhase('building'); return
    }
    const controller = new AbortController()
    controllerRef.current = controller
    setResult(null); setPhase('loading')
    try {
      const next = await reconstructFace(photoRef.current, controller.signal, nextEngine)
      if (sequence !== sequenceRef.current) return
      resultsRef.current[nextEngine] = next
      setResult(next); setPhase('building')
    } catch (cause) {
      if (sequence !== sequenceRef.current || controller.signal.aborted) return
      setError(cause.message || '重建失败，请重试。'); setPhase('error')
    }
  }
  function startReveal() {
    clearTimeout(timerRef.current)
    setShowPhoto(false)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPhase('complete'); return }
    setPhase('scanning')
    timerRef.current = setTimeout(() => {
      setPhase('fading')
      timerRef.current = setTimeout(() => setPhase('complete'), 1100)
    }, 1800)
  }
  async function openCamera() {
    if (!consented || !(engine === 'DECA' ? decaAvailable : available)) return
    clearPhoto()
    const sequence = sequenceRef.current
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      if (sequence !== sequenceRef.current) { stream.getTracks().forEach((track) => track.stop()); return }
      streamRef.current = stream; setCameraOpen(true)
    } catch { if (sequence === sequenceRef.current) setError('无法使用相机，请检查权限或改为上传照片。') }
  }
  async function takePhoto() {
    const video = videoRef.current
    if (!video?.videoWidth) { setError('相机尚未就绪，请稍后重试。'); return }
    const sequence = sequenceRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.94))
    if (sequence !== sequenceRef.current) return
    if (blob) await selectFile(new File([blob], 'camera.jpg', { type: 'image/jpeg' }))
    else { stopCamera(); setError('拍照失败，请重试。') }
  }

  const busy = ['loading', 'building', 'scanning', 'fading'].includes(phase)
  const ready = engine === 'DECA' ? decaAvailable : available
  const status = { idle: '选择一张清晰的单人正面照', loading: '正在检测人脸与重建立体表面…', building: '正在准备模型…', scanning: '正在将模型贴合照片…', fading: '正在呈现面部模型…', complete: '面部重建完成', error: '本次重建未完成' }[phase]
  return <div className="face-study-page"><section className="face-study content-section" aria-labelledby="face-study-title">
    <button className="face-back" type="button" onClick={onBack}><ArrowLeft size={16} />返回首页</button>
    <header className="face-heading"><p className="eyebrow">YASPRETTY · FACE STUDY</p><h1 id="face-study-title">看见自己的面部轮廓</h1><p>从一张照片，探索五官比例与适合自己的妆容手法。</p></header>
    {comparison && <div className="face-comparison"><p>同照片对照 · 切换方案会保留本次照片，采用相同视角和材质展示。请分别观察眉眼、鼻唇和下颌是否贴合。</p><div className="face-actions" role="group" aria-label="重建方案">
      <button className="face-button" aria-pressed={engine === '3DDFA_V2'} disabled={busy || !available} onClick={() => switchEngine('3DDFA_V2')}>3DDFA_V2</button>
      <button className="face-button" aria-pressed={engine === 'DECA'} disabled={busy || !decaAvailable} onClick={() => switchEngine('DECA')}>DECA</button>
    </div>{decaAvailable === false && <p role="status">DECA 尚未就绪，暂不能进行双模型对照。现有 3DDFA_V2 仍可使用。</p>}</div>}
    <div className="face-privacy"><p>本机科研体验 · 照片会发送到本机 YasPretty 后端用于本次重建，不发送第三方、不写入日志或持久保存。处理结束后释放照片；删除或离开页面会清除预览和结果，并取消未完成请求。</p>
      <label><input type="checkbox" checked={consented} onChange={(event) => { setConsented(event.target.checked); if (!event.target.checked) clearPhoto() }} />我同意将照片交由本机后端进行本次分析</label>
    </div>
    {ready === false && <p className="face-error" role="status">本机面部重建服务尚未准备好，暂时无法开始分析。</p>}
    <div className="face-actions">
      <label className={`face-button${!consented || !ready ? ' is-disabled' : ''}`}><ImagePlus size={17} />选择照片<input aria-label="选择人脸照片" type="file" accept="image/jpeg,image/png,image/webp" disabled={!consented || !ready} onChange={(event) => { const file = event.target.files?.[0]; if (file) selectFile(file); event.target.value = '' }} /></label>
      <button className="face-button" type="button" disabled={!consented || !ready} onClick={openCamera}><Camera size={17} />打开相机</button>
      {(preview || busy) && <button className="face-button face-button--quiet" type="button" onClick={clearPhoto}><Trash2 size={16} />{busy ? '取消并清除' : '删除照片与结果'}</button>}
    </div>
    {cameraOpen && <div className="face-camera"><video ref={videoRef} autoPlay playsInline muted /><div><button className="face-button" type="button" onClick={takePhoto}>拍照分析</button><button className="face-button" type="button" onClick={() => { sequenceRef.current++; stopCamera() }} aria-label="关闭相机"><X size={17} /></button></div></div>}
    <p className="face-status" role="status" aria-live="polite"><ScanFace size={17} />{status}</p>
    {error && <p className="face-error" role="alert">{error}</p>}
    {!preview && !cameraOpen && <div className="face-empty"><ScanFace size={52} strokeWidth={1} /><p>自然光 · 正面 · 眉眼无遮挡</p><span>JPG / PNG / WebP，最大 8 MB</span></div>}
    {preview && !result && <div className={`face-stage face-stage--preview is-${phase}`}><img className="face-stage__photo" src={preview} alt="本次分析的照片" />{phase === 'loading' && <div className="face-scanline" aria-hidden="true" />}</div>}
    {result && <Suspense fallback={<div className="face-empty">正在准备立体展示…</div>}><FaceStudyViewer result={result} preview={preview} phase={phase} showPhoto={showPhoto} annotations={annotations} thirdsStatus={thirdsStatus} onReady={startReveal} onUnavailable={() => { clearTimeout(timerRef.current); setPhase('error'); setError('当前设备无法显示 3D 模型。照片保留，可换支持 WebGL 的浏览器重试。') }} /></Suspense>}
    {phase === 'complete' && <>
      <div className="face-result-tools"><button className="face-button" onClick={startReveal} type="button"><RotateCcw size={15} />重播扫描</button><button className="face-button" onClick={() => setShowPhoto((value) => !value)} type="button">{showPhoto ? '只看模型' : '对照原照片'}</button><span>拖动模型可查看立体轮廓</span></div>
      <p className="face-model-note">{result.engine} · {result.vertices.length.toLocaleString()} 个表面顶点 · 本机检测与重建 {(result.inferenceMs / 1000).toFixed(2)} 秒 · 请求耗时 {(result.requestMs / 1000).toFixed(2)} 秒（含首次加载，不含页面动画）</p>
      {result.qualityIssues.length > 0 && <p className="face-quality">拍摄提示：{result.qualityIssues.join('；')}</p>}
      <FaceFeatureReport features={[...annotations, describeFaceContour(overrides.contour)]} thirds={result.thirds} thirdsStatus={thirdsStatus} overrides={overrides} onCorrect={correctFeature} onOpenProduct={onOpenProduct} />
      <p className="face-limitations">单张照片生成的是估计表面，不是真实深度或骨骼测量。光线、表情、妆容及遮挡会影响结果；目前没有经过标定的重建准确率。若模型不贴合，请重新选择照片。以上只作妆容参考，结果不会带入小Y。</p>
    </>}
  </section></div>
}
