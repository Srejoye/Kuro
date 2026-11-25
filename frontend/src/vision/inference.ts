import * as ort from 'onnxruntime-web'

const BASE = import.meta.env.BASE_URL
const MODEL_URL = `${BASE}models/lunar_crater_detector.onnx`
const DEFAULT_INPUT_SIZE = 1024
const CONFIDENCE_THRESHOLD = 0.25
const NMS_IOU_THRESHOLD = 0.7
const MAX_DETECTIONS = 300

// Use one WASM thread for broad browser compatibility. All native ORT calls
// are also serialized because the WASM backend can reject overlapping starts.
ort.env.wasm.numThreads = 1

export type CraterDetection = {
  confidence: number
  x: number
  y: number
  width: number
  height: number
  /** Mean of the detected box width and height, in source-image pixels. */
  boxSpanPx: number
}

export type CraterVisionResult = {
  craters: CraterDetection[]
  imageWidth: number
  imageHeight: number
  modelInputSize: number
  rawCandidateCount: number
}

let craterSession: ort.InferenceSession | null = null
let loadPromise: Promise<void> | null = null
let operationQueue: Promise<void> = Promise.resolve()

function withOrtLock<T>(operation: () => Promise<T>): Promise<T> {
  const next = operationQueue.then(operation, operation)
  operationQueue = next.then(() => undefined, () => undefined)
  return next
}

function getSquareInputSize(session: ort.InferenceSession): number {
  const meta = session.inputMetadata[0]
  if (meta?.isTensor) {
    const height = meta.shape[2]
    const width = meta.shape[3]
    if (typeof height === 'number' && height > 0 && height === width) return height
  }
  return DEFAULT_INPUT_SIZE
}

export async function loadCraterModel(): Promise<boolean> {
  if (craterSession) return true

  if (!loadPromise) {
    loadPromise = (async () => {
      const session = await withOrtLock(() => ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      }))
      if (!session.inputNames.length || !session.outputNames.length) {
        throw new Error('The crater ONNX model has no input or output tensors')
      }
      const inputSize = getSquareInputSize(session)
      if (inputSize !== DEFAULT_INPUT_SIZE) {
        throw new Error(`Crater model input is ${inputSize}×${inputSize}; expected the exported 1024×1024 model. Re-export it with export_crater.py.`)
      }
      craterSession = session
    })()
  }

  try {
    await loadPromise
    return true
  } catch (error) {
    loadPromise = null
    craterSession = null
    throw new Error(`Could not load the lunar crater model: ${error instanceof Error ? error.message : String(error)}`)
  }
}

type PreparedImage = {
  tensor: ort.Tensor
  scale: number
  offsetX: number
  offsetY: number
}

/** Ultralytics-style RGB letterbox to a square canvas, with 114 padding. */
function prepareLetterboxedImage(image: HTMLImageElement, size: number): PreparedImage {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas is unavailable in this browser')

  context.fillStyle = 'rgb(114,114,114)'
  context.fillRect(0, 0, size, size)

  const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight)
  const resizedWidth = Math.round(image.naturalWidth * scale)
  const resizedHeight = Math.round(image.naturalHeight * scale)
  const offsetX = Math.round((size - resizedWidth) / 2 - 0.1)
  const offsetY = Math.round((size - resizedHeight) / 2 - 0.1)
  context.drawImage(image, offsetX, offsetY, resizedWidth, resizedHeight)

  const rgba = context.getImageData(0, 0, size, size).data
  const plane = size * size
  const input = new Float32Array(3 * plane)
  for (let pixel = 0; pixel < plane; pixel++) {
    input[pixel] = rgba[pixel * 4] / 255
    input[plane + pixel] = rgba[pixel * 4 + 1] / 255
    input[2 * plane + pixel] = rgba[pixel * 4 + 2] / 255
  }

  return {
    tensor: new ort.Tensor('float32', input, [1, 3, size, size]),
    scale,
    offsetX,
    offsetY,
  }
}

function intersectionOverUnion(a: CraterDetection, b: CraterDetection): number {
  const left = Math.max(a.x, b.x)
  const top = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top)
  const union = a.width * a.height + b.width * b.height - intersection
  return union > 0 ? intersection / union : 0
}

function nonMaximumSuppression(detections: CraterDetection[]): CraterDetection[] {
  const candidates = [...detections].sort((a, b) => b.confidence - a.confidence)
  const kept: CraterDetection[] = []
  while (candidates.length && kept.length < MAX_DETECTIONS) {
    const best = candidates.shift()!
    kept.push(best)
    for (let index = candidates.length - 1; index >= 0; index--) {
      if (intersectionOverUnion(best, candidates[index]) > NMS_IOU_THRESHOLD) {
        candidates.splice(index, 1)
      }
    }
  }
  return kept
}

function decodeCraterOutput(
  prediction: ort.Tensor,
  image: HTMLImageElement,
  prepared: PreparedImage,
): { craters: CraterDetection[]; rawCandidateCount: number } {
  const dims = prediction.dims
  const data = prediction.data as Float32Array
  if (dims.length !== 3 || dims[0] !== 1) {
    throw new Error(`Unexpected crater model output shape: [${dims.join(', ')}]`)
  }

  // Default YOLO26 export (nms=None): [1, 4 + classes, N] or [1, N, 4 + classes].
  // This checkpoint has one class, so its raw output has five values per candidate.
  // The decoder also accepts an end-to-end [1, 300, 6] export: xyxy, score, class.
  const channelsFirst = dims[1] === 5 || dims[1] === 6
  const features = channelsFirst ? dims[1] : dims[2]
  if (![5, 6].includes(features)) {
    throw new Error(`Expected 5 raw or 6 postprocessed values per crater; received [${dims.join(', ')}]`)
  }
  const count = channelsFirst ? dims[2] : dims[1]
  const valueAt = (row: number, column: number) =>
    channelsFirst ? data[column * count + row] : data[row * features + column]
  const processedXYXY = features === 6

  const detections: CraterDetection[] = []
  for (let index = 0; index < count; index++) {
    let confidence: number
    let x1Model: number
    let y1Model: number
    let x2Model: number
    let y2Model: number

    if (processedXYXY) {
      confidence = valueAt(index, 4)
      const classId = Math.round(valueAt(index, 5))
      if (classId !== 0) continue
      x1Model = valueAt(index, 0)
      y1Model = valueAt(index, 1)
      x2Model = valueAt(index, 2)
      y2Model = valueAt(index, 3)
    } else {
      confidence = valueAt(index, 4)
      const centerX = valueAt(index, 0)
      const centerY = valueAt(index, 1)
      const boxWidth = valueAt(index, 2)
      const boxHeight = valueAt(index, 3)
      x1Model = centerX - boxWidth / 2
      y1Model = centerY - boxHeight / 2
      x2Model = centerX + boxWidth / 2
      y2Model = centerY + boxHeight / 2
    }

    if (!Number.isFinite(confidence) || confidence < CONFIDENCE_THRESHOLD) continue
    if (![x1Model, y1Model, x2Model, y2Model].every(Number.isFinite)) continue

    const x1 = Math.max(0, Math.min(image.naturalWidth, (x1Model - prepared.offsetX) / prepared.scale))
    const y1 = Math.max(0, Math.min(image.naturalHeight, (y1Model - prepared.offsetY) / prepared.scale))
    const x2 = Math.max(0, Math.min(image.naturalWidth, (x2Model - prepared.offsetX) / prepared.scale))
    const y2 = Math.max(0, Math.min(image.naturalHeight, (y2Model - prepared.offsetY) / prepared.scale))
    const width = x2 - x1
    const height = y2 - y1
    if (width < 2 || height < 2) continue

    detections.push({
      confidence,
      x: x1,
      y: y1,
      width,
      height,
      boxSpanPx: (width + height) / 2,
    })
  }

  return {
    craters: processedXYXY ? detections.slice(0, MAX_DETECTIONS) : nonMaximumSuppression(detections),
    rawCandidateCount: count,
  }
}

async function detectCraters(image: HTMLImageElement): Promise<{ craters: CraterDetection[]; rawCandidateCount: number }> {
  if (!craterSession) throw new Error('Lunar crater detector is not loaded')
  const session = craterSession
  const prepared = prepareLetterboxedImage(image, DEFAULT_INPUT_SIZE)
  const output = await withOrtLock(() => session.run({
    [session.inputNames[0]]: prepared.tensor,
  }))
  const prediction = output[session.outputNames[0]]
  if (!prediction) throw new Error('The crater model returned no prediction tensor')
  return decodeCraterOutput(prediction, image, prepared)
}

export async function runCraterInference(file: File): Promise<CraterVisionResult> {
  if (!file.type.startsWith('image/')) throw new Error('Please select a valid image file')
  await loadCraterModel()

  const image = new Image()
  const objectUrl = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Could not decode the selected image'))
      image.src = objectUrl
    })
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error('The selected image has invalid dimensions')
    }

    const { craters, rawCandidateCount } = await detectCraters(image)
    return {
      craters,
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,
      modelInputSize: DEFAULT_INPUT_SIZE,
      rawCandidateCount,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
