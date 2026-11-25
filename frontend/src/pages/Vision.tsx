import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowRight, BrainCircuit, CircleDashed, ImagePlus, Scan, ShieldCheck, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Section } from '../components/site/Section'
import { SiteFooter } from '../components/site/SiteFooter'
import { useReveal } from '../components/site/useReveal'
import { runCraterInference, type CraterVisionResult } from '../vision/inference'
import '../styles/site.css'
import '../styles/vision.css'

const STORY = `${import.meta.env.BASE_URL}hero/story/`

type Preview = { name: string; url: string }

type CraterMetrics = {
  meanConfidence: number
  medianConfidence: number
  medianSpan: number
  largestSpan: number
  detectionsPerMegapixel: number
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function CraterOverlay({ result }: { result: CraterVisionResult }) {
  const labelHeight = Math.max(18, result.imageWidth * 0.018)
  const fontSize = Math.max(12, result.imageWidth * 0.012)
  const strokeWidth = Math.max(2, result.imageWidth * 0.0022)
  return (
    <svg
      className="kv-overlay"
      viewBox={`0 0 ${result.imageWidth} ${result.imageHeight}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Detected lunar crater bounding boxes"
    >
      {result.craters.map((crater, index) => (
        <g key={`crater-${index}`}>
          <rect
            x={crater.x}
            y={crater.y}
            width={crater.width}
            height={crater.height}
            fill="rgba(220,179,107,0.07)"
            stroke="#e3b96f"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={crater.x + crater.width / 2}
            cy={crater.y + crater.height / 2}
            r={Math.max(2, strokeWidth * 1.3)}
            fill="#f4d69b"
            stroke="#18130a"
            strokeWidth={strokeWidth * 0.45}
          />
          <rect
            x={crater.x}
            y={Math.max(0, crater.y - labelHeight)}
            width={Math.min(Math.max(crater.width, fontSize * 8), result.imageWidth - crater.x)}
            height={labelHeight}
            fill="#e3b96f"
          />
          <text
            x={crater.x + 4}
            y={Math.max(fontSize, crater.y - labelHeight / 2 + fontSize * 0.32)}
            fill="#11100d"
            fontSize={fontSize}
            fontWeight="700"
          >
            CRATER {Math.round(crater.confidence * 100)}%
          </text>
        </g>
      ))}
    </svg>
  )
}

export function Vision() {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [modelAsset, setModelAsset] = useState(false)
  const [assetsChecked, setAssetsChecked] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<CraterVisionResult | null>(null)
  const [inferenceMs, setInferenceMs] = useState<number | null>(null)
  const [inferenceError, setInferenceError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const runLockRef = useRef(false)
  useReveal(root)

  const metrics = useMemo<CraterMetrics | null>(() => {
    if (!result) return null
    const craters = result.craters
    const megapixels = (result.imageWidth * result.imageHeight) / 1_000_000
    const confidence = craters.map(item => item.confidence * 100)
    const spans = craters.map(item => item.boxSpanPx)
    return {
      meanConfidence: confidence.length ? confidence.reduce((sum, value) => sum + value, 0) / confidence.length : 0,
      medianConfidence: median(confidence),
      medianSpan: median(spans),
      largestSpan: spans.length ? Math.max(...spans) : 0,
      detectionsPerMegapixel: megapixels > 0 ? craters.length / megapixels : 0,
    }
  }, [result])

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    fetch(`${base}models/lunar_crater_detector.onnx`, { method: 'HEAD' })
      .then(response => setModelAsset(response.ok))
      .catch(() => setModelAsset(false))
      .finally(() => setAssetsChecked(true))
  }, [])

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url)
  }, [preview])

  const setSelectedPreview = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setInferenceError('Please choose a PNG, JPG or WEBP image.')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview({ name: file.name, url })
    setSelectedFile(file)
    setResult(null)
    setInferenceMs(null)
    setInferenceError('')
  }

  const handleRunAnalysis = async () => {
    if (!selectedFile || running || runLockRef.current) return
    runLockRef.current = true
    setRunning(true)
    setInferenceError('')
    setResult(null)
    const startedAt = performance.now()
    try {
      const output = await runCraterInference(selectedFile)
      setResult(output)
      setInferenceMs(performance.now() - startedAt)
    } catch (error) {
      setInferenceError(error instanceof Error ? error.message : 'Crater inference failed')
    } finally {
      runLockRef.current = false
      setRunning(false)
    }
  }

  const statusText = running
    ? 'Crater analysis running'
    : inferenceError
      ? 'Inference failed'
      : result
        ? 'Crater inference complete'
        : assetsChecked && modelAsset
          ? 'Crater model ready'
          : assetsChecked
            ? 'Crater model setup required'
            : 'Checking crater model'

  return (
    <div className="kpage" ref={root}>
      <section className="kp-hero" aria-labelledby="vision-title">
        <div className="kp-hero-body">
          <p className="kp-label reveal"><span>Vision</span>Crater intelligence</p>
          <h1 id="vision-title" className="reveal d1">Read the surface. <em>Locate the craters.</em></h1>
          <p className="kp-lede reveal d2">A real-lunar-image crater detector for visual inspection of lunar surface imagery, with confidence, apparent size and detection-density metrics.</p>
          <dl className="kp-stats reveal d3">
            <div><dt>Detector</dt><dd>YOLO26s</dd></div>
            <div><dt>Task</dt><dd>Crater boxes</dd></div>
            <div><dt>Input</dt><dd>1024 × 1024</dd></div>
            <div><dt>Training domain</dt><dd>LROC WAC</dd></div>
          </dl>
        </div>
        <div className="kp-horizon" aria-hidden="true"><img src={`${STORY}mountains.webp`} alt="" /></div>
      </section>

      <Section n="01" label="Interactive workspace" title="Lunar crater detection.">
        <p className={`kv-status ${inferenceError ? 'is-error' : result ? 'is-success' : ''}`}>
          <CircleDashed size={13} aria-hidden="true" />{statusText}
        </p>
        <div className="kv-demo">
          <div className="kv-panel">
            <div className="kv-stage">
              {preview ? (
                <>
                  <img className="kv-preview-image" src={preview.url} alt="Selected lunar surface" />
                  {result && <CraterOverlay result={result} />}
                </>
              ) : (
                <div className="kv-empty">
                  <div className="kv-empty-icon"><ImagePlus size={25} aria-hidden="true" /></div>
                  <b>Your lunar image goes here</b>
                  <span>Upload an LROC, Apollo or rover-perspective lunar image</span>
                </div>
              )}
            </div>
            <div className="kv-actions">
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={event => {
                  const file = event.currentTarget.files?.[0]
                  if (file) setSelectedPreview(file)
                  event.currentTarget.value = ''
                }}
              />
              <button type="button" className="kv-btn" onClick={() => inputRef.current?.click()} disabled={running}>
                <Upload size={14} /> Upload image
              </button>
              <button
                type="button"
                className={`kv-btn kv-run-btn ${selectedFile ? 'is-ready' : ''}`}
                disabled={!selectedFile || running || !modelAsset}
                aria-busy={running}
                onClick={() => void handleRunAnalysis()}
              >
                <Scan size={15} />{running ? 'Detecting craters...' : 'Run analysis'}
              </button>
              {preview && (
                <button
                  type="button"
                  className="kv-btn ghost"
                  disabled={running}
                  onClick={() => {
                    setPreview(null)
                    setSelectedFile(null)
                    setResult(null)
                    setInferenceMs(null)
                    setInferenceError('')
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                >
                  <X size={14} /> Clear
                </button>
              )}
              <span className="kv-file">{preview?.name ?? 'PNG, JPG or WEBP'}</span>
            </div>
          </div>

          <aside className="kv-panel kv-output">
            <div className="kv-output-title"><Scan size={16} aria-hidden="true" /><b>Crater analysis</b><span>{running ? 'RUNNING' : result ? 'READY' : '—'}</span></div>
            {running ? (
              <div className="kv-output-empty">
                <CircleDashed className="kv-spinner" size={28} aria-hidden="true" />
                <b>Scanning lunar surface</b>
                <p>YOLO26s is evaluating crater candidates at 1024 × 1024. The first run may take longer while the ONNX model initialises.</p>
              </div>
            ) : inferenceError ? (
              <div className="kv-output-empty kv-output-error" role="alert">
                <AlertTriangle size={26} aria-hidden="true" />
                <b>Crater inference could not complete</b>
                <p>{inferenceError}</p>
              </div>
            ) : result && metrics ? (
              <div className="kv-results">
                <div className="kv-result-stat"><span>Crater detections</span><b>{result.craters.length}</b></div>
                <div className="kv-result-stat"><span>Mean confidence</span><b>{metrics.meanConfidence.toFixed(1)}%</b></div>
                <div className="kv-result-stat"><span>Median confidence</span><b>{metrics.medianConfidence.toFixed(1)}%</b></div>
                <div className="kv-result-stat"><span>Median box span</span><b>{metrics.medianSpan.toFixed(1)} px</b></div>
                <div className="kv-result-stat"><span>Largest box span</span><b>{metrics.largestSpan.toFixed(1)} px</b></div>
                <div className="kv-result-stat"><span>Detections / megapixel</span><b>{metrics.detectionsPerMegapixel.toFixed(2)}</b></div>
                <div className="kv-result-stat"><span>Inference time</span><b>{inferenceMs == null ? '—' : `${(inferenceMs / 1000).toFixed(2)} s`}</b></div>
                {result.craters.length === 0 && <p className="kv-no-detections">No crater candidates passed the 25% confidence threshold. This does not prove the image contains no craters.</p>}
                <p className="kv-metric-footnote">Crater bounding-box dimensions are reported in image pixels.</p>
              </div>
            ) : (
              <div className="kv-output-empty">
                <BrainCircuit size={26} aria-hidden="true" />
                <b>{assetsChecked && modelAsset ? 'Crater model ready · awaiting image' : assetsChecked ? 'Crater model not installed' : 'Checking model file'}</b>
                <p>{assetsChecked && modelAsset
                  ? 'Upload a lunar image and run analysis to inspect crater candidates, confidence and apparent box sizes.'
                  : assetsChecked
                    ? 'Run export_crater.py from the KURO project root to download the official checkpoint and export the browser ONNX model.'
                    : 'Checking whether the lunar_crater_detector.onnx model is available.'}</p>
                {assetsChecked && !modelAsset && <code className="kv-setup-command">python export_crater.py</code>}
              </div>
            )}
            <div className="kv-legend">
              <p className="kv-k">Detection overlay</p>
              <div><i style={{ background: '#e3b96f' }} /> Crater candidate</div>
              <div><i style={{ background: '#f4d69b' }} /> Candidate centre</div>
            </div>
          </aside>
        </div>

        {result && metrics && (
          <div className="kv-detection-table-wrap">
            <div className="kv-detection-table-heading">
              <div><p className="kv-k">Per-detection measurements</p><h3>Detected crater candidates</h3></div>
              <span>{result.craters.length} total · top 20 by confidence</span>
            </div>
            {result.craters.length ? (
              <div className="kv-table-wrap">
                <table className="kv-table kv-detection-table">
                  <thead><tr><th>Candidate</th><th>Confidence</th><th>Box width</th><th>Box height</th><th>Mean box span</th></tr></thead>
                  <tbody>
                    {result.craters.slice(0, 20).map((crater, index) => (
                      <tr key={`${index}-${crater.x}-${crater.y}`}>
                        <td><b>Crater {String(index + 1).padStart(2, '0')}</b></td>
                        <td className="kv-num">{(crater.confidence * 100).toFixed(1)}%</td>
                        <td className="kv-num">{crater.width.toFixed(1)} px</td>
                        <td className="kv-num">{crater.height.toFixed(1)} px</td>
                        <td className="kv-num">{crater.boxSpanPx.toFixed(1)} px</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="kv-no-detections">No candidate measurements to display.</p>}
          </div>
        )}
      </Section>

      <Section n="02" label="Model performance" title="High-performance crater detection on real lunar imagery.">
        <p className="kp-p">The crater detector is built on a real-lunar-image fine-tuning pipeline, with benchmark performance evaluated using LROC WAC imagery.</p>
        <div className="kv-benchmark-grid">
          <article className="kv-benchmark-card"><span>mAP@50</span><b>94.7%</b><small>Crater detection performance</small></article>
          <article className="kv-benchmark-card"><span>mAP@50–95</span><b>83.0%</b><small>IoU-averaged detection performance</small></article>
          <article className="kv-benchmark-card"><span>Robbins ≥2 km recall</span><b>60.6%</b><small>Human-verified crater subset</small></article>
          <article className="kv-benchmark-card"><span>Isolated-tile mAP@50</span><b>94.2%</b><small>Separated evaluation tiles</small></article>
        </div>
        <div className="kv-benchmark-context">
          <div><b>Training imagery</b><span>8,756 real LROC WAC patches · approximately 100 m/px · 416 × 416 source patches</span></div>
          <div><b>Evaluation dataset</b><span>1,545 held-out image patches</span></div>
          <div><b>Best-supported crater scale</b><span>Approximately 1–4 km craters</span></div>
        </div>
      </Section>

      <Section n="03" label="Model details" title="Built to explore lunar crater landscapes.">
        <p className="kv-status"><ShieldCheck size={13} aria-hidden="true" />Architecture, data and analysis capabilities</p>
        <div className="kp-principles">
          <div><p className="kp-k">Architecture</p><h3>YOLO26s detector</h3><p>Single-class lunar crater detection with bounding-box localisation, confidence estimation and 1024 × 1024 image input.</p></div>
          <div><p className="kp-k">Training data</p><h3>Real LROC WAC imagery</h3><p>Fine-tuned crater detection checkpoint using the LU3M6TGT lunar imagery dataset.</p></div>
          <div><p className="kp-k">Analysis capabilities</p><h3>Detailed crater measurements</h3><p>Crater candidate localisation, confidence ranking, apparent bounding-box dimensions and detection-density statistics.</p></div>
        </div>
      </Section>

      <section className="kp-cta">
        <h2 className="reveal">Explore the Moon’s South Pole.</h2>
        <p className="reveal d1">Explore the Moon's South Pole through intelligent crater detection, detailed terrain insights and interactive lunar visualisation.</p>
        <div className="kp-cta-row reveal d2">
          <Link to="/explorer" className="kp-btn">Open the Explorer <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link to="/data" className="kp-link">See the data <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
