/**
 * Camera and file handling utilities for SnapScience PWA
 */

export interface CameraStreamResult {
  stream: MediaStream | null
  error: string | null
  permissionDenied: boolean
  noCamera: boolean
}

export async function requestCameraStream(facingMode: 'environment' | 'user' = 'environment'): Promise<CameraStreamResult> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      stream: null,
      error: 'Trình duyệt của bạn không hỗ trợ camera web standard.',
      permissionDenied: false,
      noCamera: true
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    })
    return {
      stream,
      error: null,
      permissionDenied: false,
      noCamera: false
    }
  } catch (err: any) {
    console.warn('Camera request failed:', err)
    
    // Check error type
    const isPermissionDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
    const isNotFound = err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
    
    let errorMsg = 'Không thể truy cập camera.'
    if (isPermissionDenied) {
      errorMsg = 'Quyền truy cập camera bị từ chối. Vui lòng bật quyền camera trong cài đặt trình duyệt.'
    } else if (isNotFound) {
      errorMsg = 'Không tìm thấy camera trên thiết bị này.'
    }
    
    return {
      stream: null,
      error: errorMsg,
      permissionDenied: isPermissionDenied,
      noCamera: isNotFound
    }
  }
}

export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return
  try {
    stream.getTracks().forEach(track => {
      track.stop()
    })
  } catch (err) {
    console.error('Error stopping stream tracks:', err)
  }
}

export function captureVideoFrame(videoElement: HTMLVideoElement, maxDimension = 1024): string | null {
  if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
    return null
  }

  try {
    let width = videoElement.videoWidth
    let height = videoElement.videoHeight

    // Resize image to maxDimension (e.g. 1024px) for fast network upload & instant AI processing
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      } else {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoElement, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', 0.78)
  } catch (err) {
    console.error('Failed to capture canvas frame:', err)
    return null
  }
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  dataUrl?: string
}

export function validateAndReadImageFile(file: File, maxSizeMB = 10, maxDimension = 1024): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ valid: false, error: 'Không tìm thấy tập tin.' })
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      resolve({
        valid: false,
        error: 'Định dạng ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP.'
      })
      return
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      resolve({
        valid: false,
        error: `Kích thước ảnh vượt quá ${maxSizeMB}MB. Vui lòng chọn ảnh nhỏ hơn.`
      })
      return
    }

    if (file.size === 0) {
      resolve({ valid: false, error: 'Tập tin ảnh bị rỗng.' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (!dataUrl) {
        resolve({ valid: false, error: 'Không thể đọc dữ liệu ảnh.' })
        return
      }

      // Resize uploaded image to speed up transfer
      const img = new Image()
      img.onload = () => {
        try {
          let width = img.width
          let height = img.height

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            } else {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            resolve({ valid: true, dataUrl: canvas.toDataURL('image/jpeg', 0.78) })
            return
          }
        } catch {
          // Fallback if canvas resize fails
        }
        resolve({ valid: true, dataUrl })
      }
      img.onerror = () => {
        resolve({ valid: true, dataUrl })
      }
      img.src = dataUrl
    }
    reader.onerror = () => {
      resolve({ valid: false, error: 'Lỗi khi đọc file ảnh.' })
    }
    reader.readAsDataURL(file)
  })
}

