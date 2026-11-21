function validateFaceFile(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return '请选择 JPG、PNG 或 WebP 照片。'
  if (file.size > 8 * 1024 * 1024) return '照片不能超过 8 MB。'
  return ''
}

export async function prepareFacePhoto(file) {
  const error = validateFaceFile(file)
  if (error) throw new Error(error)
  const bitmap = await createImageBitmap(file)
  try {
    if (Math.min(bitmap.width, bitmap.height) < 320) throw new Error('照片分辨率太低，请选择清晰的正面照片。')
    if (bitmap.width * bitmap.height > 24000000) throw new Error('照片像素过大，请缩小到 2400 万像素以内。')
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.94))
    if (!blob) throw new Error('无法读取照片，请重新选择。')
    return blob
  } finally { bitmap.close() }
}

export async function reconstructFace(blob, signal, engine = '3DDFA_V2') {
  const started = performance.now()
  const response = await fetch(`/api/face-reconstruction${engine === 'DECA' ? '/deca' : ''}`, {
    method: 'POST', signal, cache: 'no-store',
    headers: { 'Content-Type': 'application/octet-stream', 'X-Face-Consent': 'local-research-v1' }, body: blob,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.ok) throw new Error(body?.error?.message || '本机重建服务暂时不可用，请稍后重试。')
  return { ...body.result, requestMs: Math.round(performance.now() - started) }
}
