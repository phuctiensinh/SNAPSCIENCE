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

export function captureVideoFrame(videoElement: HTMLVideoElement): string | null {
  if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
    return null
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.88)
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

export function validateAndReadImageFile(file: File, maxSizeMB = 10): Promise<FileValidationResult> {
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
      if (dataUrl) {
        resolve({ valid: true, dataUrl })
      } else {
        resolve({ valid: false, error: 'Không thể đọc dữ liệu ảnh.' })
      }
    }
    reader.onerror = () => {
      resolve({ valid: false, error: 'Lỗi khi đọc file ảnh.' })
    }
    reader.readAsDataURL(file)
  })
}
