'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Beaker, BookOpen, Camera, Check, ChevronRight,
  Clock3, Compass, Download, Gauge, Grid2X2, History, Home,
  Lightbulb, Menu, Moon, MoreHorizontal, Pause, Play, RotateCcw, Scan,
  Search, Settings, Sparkles, Sun, Trash2, Upload, X, Zap, AlertCircle, RefreshCw, ShieldCheck, Key, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AIAnalysisResult, HistoryItem, UserProgress, DifficultyLevel, QuizQuestion, DailyDiscovery
} from '@/lib/types'
import {
  calculateWheel, calculateLightbulbEnergy, calculateStairIncline,
  calculateMirrorReflection, calculatePlantPhotosynthesis
} from '@/lib/calculations'
import {
  getHistory, saveHistoryItem, deleteHistoryItem, clearHistory,
  checkIfPreviouslyScanned, getUserProgress, recordQuizAnswer,
  getDifficultyPreference, setDifficultyPreference, getDailyDiscovery
} from '@/lib/storage'
import { MOCK_DATABASE, validateGeminiApiKey } from '@/lib/ai'
import { requestCameraStream, stopCameraStream, captureVideoFrame, validateAndReadImageFile } from '@/lib/camera'

type Tab = 'home' | 'discover' | 'learn' | 'history'
type Flow = 'home' | 'camera' | 'preview' | 'analyzing' | 'result' | 'lesson' | 'experiment' | 'quiz' | 'complete' | 'privacy'

function IconButton({ children, label, onClick, className }: { children: React.ReactNode; label: string; onClick?: () => void; className?: string }) {
  return <button aria-label={label} onClick={onClick} className={cn('grid size-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10', className)}>{children}</button>
}

function ModeBadge({ hasUserApiKey, onClick }: { hasUserApiKey: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black tracking-wide border shadow-sm transition active:scale-95',
        hasUserApiKey
          ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200'
          : 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
      )}
    >
      <span className={cn('size-2 rounded-full animate-pulse', hasUserApiKey ? 'bg-emerald-500' : 'bg-amber-500')} />
      <span>{hasUserApiKey ? 'GEMINI AI VISION THẬT' : 'DEMO MODE (MẪU)'}</span>
    </button>
  )
}

function AppShell({ children, tab, setTab, onScan }: { children: React.ReactNode; tab: Tab; setTab: (tab: Tab) => void; onScan: () => void }) {
  const tabs = [
    { id: 'home' as Tab, label: 'Trang chủ', icon: Home },
    { id: 'discover' as Tab, label: 'Khám phá', icon: Compass },
    { id: 'learn' as Tab, label: 'Học', icon: BookOpen },
    { id: 'history' as Tab, label: 'Lịch sử', icon: Clock3 },
  ]
  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#10233f] dark:bg-[#0c1424] dark:text-slate-100">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f8fc] shadow-[0_0_70px_rgba(31,75,125,.08)] dark:bg-[#0c1424]">
        {children}
        <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-end justify-around border-t border-slate-200/70 bg-white/90 px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(20,46,86,.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#111d31]/90">
          {tabs.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={cn('flex w-20 flex-col items-center gap-1 text-[10px] font-semibold transition', tab === id ? 'text-[#1587e8]' : 'text-slate-400')}>
              <Icon className="size-[21px]" />
              <span>{label}</span>
            </button>
          ))}
          <button onClick={onScan} className="-mt-10 flex flex-col items-center gap-1">
            <span className="grid size-[62px] place-items-center rounded-full border-[6px] border-[#f5f8fc] bg-[#1587e8] text-white shadow-[0_7px_24px_rgba(21,135,232,.4)] dark:border-[#0c1424]">
              <Camera className="size-7" />
            </span>
            <span className="text-[10px] font-bold text-[#1587e8]">Scan</span>
          </button>
          {tabs.slice(2).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={cn('flex w-20 flex-col items-center gap-1 text-[10px] font-semibold transition', tab === id ? 'text-[#1587e8]' : 'text-slate-400')}>
              <Icon className="size-[21px]" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

function HomeScreen({
  onScan,
  onExplore,
  onOpenPrivacy,
  onSelectHistoryItem,
  progress,
  historyItems,
  dailyDiscovery,
  hasUserApiKey
}: {
  onScan: () => void;
  onExplore: (topicHint?: string) => void;
  onOpenPrivacy: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  progress: UserProgress;
  historyItems: HistoryItem[];
  dailyDiscovery: DailyDiscovery;
  hasUserApiKey: boolean;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showInstallGuide, setShowInstallGuide] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
      setIsStandalone(Boolean(isStandaloneApp))

      const handler = (e: any) => {
        e.preventDefault()
        setDeferredPrompt(e)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      setShowInstallGuide(true)
    }
  }

  const recentDiscoveries = historyItems.slice(0, 5)

  return (
    <main className="px-5 pb-32 pt-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[#dff4ff] text-[#1587e8] dark:bg-[#123452]">
            <Beaker className="size-5" />
          </span>
          <span className="font-black tracking-[-.04em]">Snap<span className="text-[#1587e8]">Science</span></span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Quyền riêng tư & Cài đặt" onClick={onOpenPrivacy}>
            <Settings className="size-5" />
          </IconButton>
        </div>
      </header>

      {/* Main Hero Card */}
      <section className="relative mt-7 overflow-hidden rounded-[30px] bg-[#102d50] p-6 text-white shadow-[0_18px_35px_rgba(16,45,80,.18)]">
        <div className="absolute -right-10 -top-12 size-44 rounded-full bg-[#2fb6fa]/25 blur-2xl" />
        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#80d7ff]">Khoa học ở quanh ta</p>
          <h1 className="max-w-[320px] text-[38px] font-black leading-[.98] tracking-[-.06em]">Chụp một thứ.<br />Hiểu cả một thế giới.</h1>
          <p className="mt-5 max-w-[270px] text-sm leading-6 text-slate-300">Khám phá khoa học ẩn trong những điều bạn nhìn thấy mỗi ngày.</p>
          
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={onScan} className="inline-flex items-center gap-2 rounded-full bg-[#56c5ff] px-5 py-3 text-sm font-extrabold text-[#082746] shadow-lg shadow-cyan-950/20 active:scale-95 transition">
              <Camera className="size-4" /> Chụp để khám phá
            </button>
            {progress.streakDays > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-black text-amber-300 border border-amber-400/30">
                🔥 Chuỗi: {progress.streakDays} ngày
              </span>
            )}
          </div>
        </div>

        <div className="relative mx-auto mt-7 h-32 w-52 rounded-[27px] border-4 border-white/40 bg-gradient-to-br from-sky-300/60 via-blue-700/50 to-indigo-900/70 p-3 shadow-2xl">
          <div className="grid h-full grid-cols-3 place-items-center rounded-2xl border border-white/40 bg-white/10 text-3xl backdrop-blur-sm">
            <span>🌱</span><span>💡</span><span>🪞</span><span>☕</span><span className="text-4xl">◉</span><span>🚲</span>
          </div>
        </div>
      </section>

      {/* Daily Discovery Section */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#1587e8]">Khám phá hôm nay</p>
          <button onClick={() => onExplore(dailyDiscovery.topic)} className="text-xs font-bold text-slate-400">Xem thêm</button>
        </div>
        <div className="rounded-[25px] bg-gradient-to-br from-[#fff1c8] to-[#fff9eb] p-5 dark:from-[#42371b] dark:to-[#302914]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">{dailyDiscovery.title}</h2>
              <p className="mt-2 max-w-[220px] text-sm leading-5 text-slate-600 dark:text-slate-300">{dailyDiscovery.description}</p>
            </div>
            <span className="text-5xl">{dailyDiscovery.icon}</span>
          </div>
          <button onClick={() => onExplore(dailyDiscovery.topic)} className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-[#c77b00]">
            Khám phá <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      {/* Recent History / Discoveries */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Bạn đã khám phá</h2>
          <button onClick={() => onExplore('history')} className="text-sm font-bold text-[#1587e8]">Tất cả ({progress.objectsDiscovered})</button>
        </div>
        {recentDiscoveries.length > 0 ? (
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {recentDiscoveries.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="min-w-[142px] snap-start rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#1587e8] dark:border-white/10 dark:bg-[#142238]"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-sky-100 text-2xl dark:bg-sky-900/40">
                  {item.imageUri ? (
                    <img src={item.imageUri} alt={item.objectName} className="size-full rounded-2xl object-cover" />
                  ) : (
                    '◉'
                  )}
                </span>
                <p className="mt-3 font-extrabold truncate">{item.objectName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 truncate">{item.category}</p>
                <p className="mt-3 text-[11px] text-slate-400">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400 dark:border-white/10 dark:bg-[#142238]">
            <p className="text-sm font-bold">Chưa có bài khám phá nào.</p>
            <p className="mt-1 text-xs">Hãy nhấn nút Camera để chụp và khám phá vật thể đầu tiên!</p>
          </div>
        )}
      </section>

      {/* PWA Install Banner */}
      {!isStandalone && (
        <section className="mt-7 flex items-center gap-4 rounded-[25px] border border-sky-100 bg-[#e9f8ff] p-4 dark:border-sky-900 dark:bg-[#102d45]">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm">📱</span>
          <div className="flex-1">
            <h3 className="font-extrabold">Mang SnapScience theo bạn</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">Cài ứng dụng để khám phá mọi lúc ngay cả khi offline.</p>
          </div>
          <button onClick={handleInstallClick} className="rounded-full bg-[#1587e8] px-3.5 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition">
            Cài đặt
          </button>
        </section>
      )}

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-[#10233f] dark:bg-[#142238] dark:text-white shadow-2xl">
            <h3 className="text-lg font-black">📱 Cài đặt SnapScience PWA</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-black text-[#1587e8]">1.</span>
                <span>Nhấn biểu tượng nút <b>Menu (⋮)</b> hoặc <b>Chia sẻ (Share)</b> trên trình duyệt.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-[#1587e8]">2.</span>
                <span>Chọn <b>"Thêm vào màn hình chính" (Add to Home Screen)</b> hoặc <b>"Cài đặt ứng dụng"</b>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-[#1587e8]">3.</span>
                <span>Xác nhận <b>"Thêm" / "Cài đặt"</b> để dùng như app bản địa.</span>
              </li>
            </ol>
            <button onClick={() => setShowInstallGuide(false)} className="mt-6 w-full rounded-2xl bg-[#1587e8] py-3 text-sm font-extrabold text-white">
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function CameraScreen({
  onBack,
  onCaptureImage,
  onSelectDemoObject
}: {
  onBack: () => void;
  onCaptureImage: (imageDataUri: string) => void;
  onSelectDemoObject: (objectKey: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showDemoMenu, setShowDemoMenu] = useState(false)

  // Initialize camera stream safely
  useEffect(() => {
    let activeStream: MediaStream | null = null

    async function initCamera() {
      setCameraError(null)
      const res = await requestCameraStream(facingMode)
      if (res.stream) {
        activeStream = res.stream
        setStream(res.stream)
        if (videoRef.current) {
          videoRef.current.srcObject = res.stream
        }
      } else {
        setCameraError(res.error || 'Không thể mở camera.')
      }
    }

    initCamera()

    return () => {
      stopCameraStream(activeStream)
    }
  }, [facingMode])

  const handleToggleFacingMode = () => {
    stopCameraStream(stream)
    setStream(null)
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
  }

  const handleCaptureClick = () => {
    if (videoRef.current) {
      const dataUri = captureVideoFrame(videoRef.current)
      if (dataUri) {
        stopCameraStream(stream)
        onCaptureImage(dataUri)
        return
      }
    }
    // Fallback if video capture fails
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await validateAndReadImageFile(file)
    if (result.valid && result.dataUrl) {
      stopCameraStream(stream)
      onCaptureImage(result.dataUrl)
    } else {
      alert(result.error || 'File không hợp lệ.')
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#12233c] pb-9 text-white">
      {/* Background decoration matching v0 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(42,157,210,.38),transparent_34%),linear-gradient(135deg,#1b3556,#0b1628)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)', backgroundSize: '42px 42px' }} />

      <header className="relative flex items-center justify-between px-5 pt-7 z-10">
        <IconButton label="Quay lại" onClick={() => { stopCameraStream(stream); onBack(); }} className="bg-white/10 text-white hover:bg-white/20">
          <ArrowLeft />
        </IconButton>
        <span className="rounded-full bg-black/20 px-4 py-2 text-xs font-bold backdrop-blur">Đưa một vật thể vào khung hình</span>
        <IconButton label="Trợ giúp / Demo" onClick={() => setShowDemoMenu(!showDemoMenu)} className="bg-white/10 text-white hover:bg-white/20">
          <Sparkles />
        </IconButton>
      </header>

      {/* Hidden file input fallback */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera View Finder */}
      <div className="relative mx-8 flex aspect-square items-center justify-center overflow-hidden rounded-[42px] border border-white/15 bg-black/40">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', stream ? 'opacity-100' : 'opacity-0')}
        />

        {/* Scanner UI overlays from v0 */}
        <div className="scan-corner absolute inset-5 rounded-[30px] border-2 border-white/80 pointer-events-none z-10" />
        <div className="scan-line absolute left-8 right-8 h-px bg-cyan-300 shadow-[0_0_14px_3px_rgba(103,232,249,.9)] pointer-events-none z-10" />

        {/* Camera error or placeholder display */}
        {!stream && (
          <div className="text-center p-6 relative z-10">
            {cameraError ? (
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="size-10 text-amber-400" />
                <p className="text-xs text-white/90 font-medium">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur hover:bg-white/30"
                >
                  📁 Tải ảnh từ thiết bị
                </button>
              </div>
            ) : (
              <div>
                <span className="text-7xl drop-shadow-2xl">◉</span>
                <p className="mt-4 text-xs font-semibold text-white/70">Đang khởi động camera...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative flex flex-col items-center gap-5 z-10">
        <div className="flex w-full items-center justify-around px-8">
          <IconButton label="Đổi camera" onClick={handleToggleFacingMode} className="text-white hover:bg-white/10">
            <RotateCcw />
          </IconButton>
          
          <button aria-label="Chụp ảnh" onClick={handleCaptureClick} className="grid size-[76px] place-items-center rounded-full border-[6px] border-white/90 bg-white shadow-[0_0_0_5px_rgba(255,255,255,.18)] active:scale-90 transition">
            <span className="size-[58px] rounded-full bg-white border border-slate-300" />
          </button>

          <IconButton label="Tải ảnh" onClick={() => fileInputRef.current?.click()} className="text-white hover:bg-white/10">
            <Upload />
          </IconButton>
        </div>

        <p className="text-sm font-bold">Chụp để khám phá</p>

        {/* Demo object menu selector */}
        <button onClick={() => setShowDemoMenu(!showDemoMenu)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur hover:bg-white/20 transition">
          {showDemoMenu ? 'Đóng danh sách Demo' : 'Thử ảnh mẫu (Demo Mode)'}
        </button>

        {showDemoMenu && (
          <div className="flex flex-wrap justify-center gap-2 px-6 max-w-sm">
            {['Bánh xe', 'Bóng đèn', 'Cây xanh', 'Gương', 'Cầu thang', 'Cầu vồng'].map((obj) => (
              <button
                key={obj}
                onClick={() => { stopCameraStream(stream); onSelectDemoObject(obj); }}
                className="rounded-full bg-sky-500/30 px-3 py-1 text-xs font-bold border border-sky-300/40 hover:bg-sky-400/50"
              >
                {obj}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function PreviewScreen({
  capturedImage,
  onBack,
  onAnalyze
}: {
  capturedImage: string;
  onBack: () => void;
  onAnalyze: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-[#102d50] text-white">
      <header className="flex items-center gap-3 px-5 pb-5 pt-7">
        <IconButton label="Quay lại" onClick={onBack} className="bg-white/10 text-white hover:bg-white/20">
          <ArrowLeft />
        </IconButton>
        <span className="font-bold">Xem ảnh</span>
      </header>

      <div className="relative mx-5 flex-1 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-500 via-sky-900 to-indigo-950 flex items-center justify-center">
        <div className="absolute inset-10 rounded-full bg-cyan-300/30 blur-3xl" />
        
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="relative size-full object-contain rounded-[28px]" />
        ) : (
          <div className="relative grid h-full place-items-center text-[110px]">◉</div>
        )}

        <span className="absolute bottom-5 left-5 rounded-full bg-black/50 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
          ẢNH CHỤP THẬT · CHUẨN BỊ PHÂN TÍCH
        </span>
      </div>

      <div className="rounded-t-[30px] bg-white px-6 pb-10 pt-7 text-[#10233f] dark:bg-[#142238] dark:text-white">
        <h2 className="text-xl font-extrabold">Ảnh này trông ổn chứ?</h2>
        <p className="mt-1 text-sm text-slate-500">Bạn có thể chụp lại nếu vật thể chưa rõ.</p>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onBack} className="rounded-2xl border border-slate-200 py-4 text-sm font-bold dark:border-white/10 active:scale-95 transition">
            Chụp lại
          </button>
          <button onClick={onAnalyze} className="rounded-2xl bg-[#1587e8] py-4 text-sm font-extrabold text-white shadow-lg shadow-sky-200/30 active:scale-95 transition">
            ✨ Phân tích ảnh
          </button>
        </div>
      </div>
    </main>
  )
}

function AnalyzingScreen({
  capturedImage,
  demoObjectName,
  onDone
}: {
  capturedImage: string;
  demoObjectName?: string;
  onDone: (result: AIAnalysisResult, isDemo: boolean, apiError?: string) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    let isMounted = true

    // Step animation timer
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < 2 ? prev + 1 : prev))
    }, 600)

    // Execute real AI or Mock API call
    async function performAnalysis() {
      try {
        const storedApiKey = typeof window !== 'undefined'
          ? (localStorage.getItem('snapscience_gemini_api_key') || localStorage.getItem('snapscience_user_api_key') || '')
          : ''
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUri: capturedImage || 'demo_wheel',
            prompt: demoObjectName || '',
            isDemo: isOffline || (Boolean(demoObjectName) && !storedApiKey),
            userApiKey: storedApiKey
          })
        })

        const json = await res.json()
        if (json.success && json.data) {
          if (isMounted) {
            setTimeout(() => onDone(json.data, Boolean(json.isDemo)), 400)
          }
        } else {
          // If Gemini returned an explicit error (e.g. 400 Invalid Key or API error)
          const apiErrMessage = json.error || 'Lỗi kết nối Google Gemini Vision API.'
          const fallback = MOCK_DATABASE[demoObjectName?.toLowerCase() || 'bánh xe'] || MOCK_DATABASE['bánh xe']
          if (isMounted) onDone(fallback, true, apiErrMessage)
        }
      } catch (err: any) {
        console.warn('API error, fallback to client mock:', err)
        const fallback = MOCK_DATABASE[demoObjectName?.toLowerCase() || 'bánh xe'] || MOCK_DATABASE['bánh xe']
        if (isMounted) onDone(fallback, true, err.message || 'Lỗi kết nối mạng.')
      }
    }

    performAnalysis()

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [capturedImage, demoObjectName, onDone])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#102d50] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#173e66] via-[#102d50] to-[#221c54]" />
      <div className="absolute inset-0 grid place-items-center opacity-25 blur-sm">
        <span className="text-[220px]">◉</span>
      </div>
      <div className="relative w-full px-8">
        <div className="mx-auto mb-10 grid size-24 place-items-center rounded-[30px] border border-white/20 bg-white/10 text-5xl shadow-2xl backdrop-blur">
          <Beaker className="size-10 text-cyan-300 animate-pulse" />
        </div>
        <h1 className="text-center text-3xl font-black tracking-tight">Đang quan sát...</h1>
        <p className="mt-2 text-center text-sm text-slate-300">Biến một điều quen thuộc thành một khám phá mới.</p>
        <div className="mx-auto mt-12 max-w-xs space-y-5">
          {['Nhận diện vật thể', 'Tìm kiến thức liên quan', 'Chuẩn bị khám phá'].map((item, i) => (
            <div key={item} className="flex items-center gap-4 text-sm">
              <span className={cn('grid size-7 place-items-center rounded-full transition-all', i <= stepIndex ? 'bg-emerald-400 text-[#102d50]' : 'border border-white/30 text-cyan-200')}>
                {i < stepIndex ? <Check className="size-4" /> : i === stepIndex ? <span className="size-2 animate-pulse rounded-full bg-cyan-300" /> : <span className="text-lg">○</span>}
              </span>
              <span className={i > stepIndex ? 'text-white/40' : 'text-white font-semibold'}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function ResultScreen({
  result,
  capturedImage,
  isDemo,
  apiError,
  previouslyScanned,
  onBack,
  onLesson,
  onRescan,
  onExploreTopic,
  onOpenPrivacy
}: {
  result: AIAnalysisResult;
  capturedImage: string;
  isDemo: boolean;
  apiError?: string;
  previouslyScanned?: HistoryItem;
  onBack: () => void;
  onLesson: () => void;
  onRescan: () => void;
  onExploreTopic: (topic: string) => void;
  onOpenPrivacy: () => void;
}) {
  const isLowConfidence = result.confidence < 0.70

  return (
    <main className="px-5 pb-32 pt-7">
      <header className="flex items-center gap-3">
        <IconButton label="Quay lại" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <span className="font-bold">Khám phá</span>
        
        {/* Mode Indicator Badge */}
        <ModeBadge hasUserApiKey={!isDemo} onClick={onOpenPrivacy} />

        <button onClick={onBack} className="ml-auto rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-white/10">
          <MoreHorizontal className="size-5" />
        </button>
      </header>

      {/* Captured Image View */}
      <div className="mt-5 h-56 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-400 via-sky-800 to-indigo-950 relative">
        {capturedImage ? (
          <img src={capturedImage} alt={result.objectName} className="size-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-[120px] drop-shadow-2xl">◉</div>
        )}
      </div>

      {/* Explicit API Key Error Warning Box if Gemini call failed */}
      {apiError && (
        <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1 text-xs leading-5">
              <b className="block font-black text-sm text-rose-900 dark:text-rose-200">❌ Google Gemini API Bị Lỗi</b>
              <p className="mt-1 font-semibold text-rose-800 dark:text-rose-300">{apiError}</p>
              <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                Do API Key bị sai hoặc lỗi kết nối, hệ thống phải chuyển sang Chế độ Demo (bánh xe).
              </p>
              <button
                onClick={onOpenPrivacy}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-black text-white shadow hover:bg-rose-700 active:scale-95 transition"
              >
                <Key className="size-3.5" /> Cập nhật Gemini API Key hợp lệ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice Banner */}
      {isDemo && !apiError && (
        <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-200 flex items-start gap-2.5 shadow-sm">
          <Sparkles className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 leading-5">
            <b className="block font-black text-amber-900 dark:text-amber-200">Đang ở Chế độ Demo (Dữ liệu mẫu)</b>
            Để AI nhận diện <b>THẬT 100%</b> bất kỳ vật thể nào bạn chụp (Con chuột máy tính, Đèn bàn, Quạt...), hãy bấm biểu tượng <b>⚙️ Cài đặt</b> và dán Gemini API Key miễn phí từ <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-sky-700 dark:text-sky-300">aistudio.google.com</a>!
          </div>
        </div>
      )}

      {/* Low Confidence Warning */}
      {isLowConfidence && !apiError && (
        <div className="mt-5 rounded-[22px] border border-amber-300 bg-amber-50 p-4 text-[#10233f] dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="text-sm font-black text-amber-800 dark:text-amber-300">🤔 Chưa chắc chắn</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Độ chính xác nhận diện thấp. Có vẻ đây là: <b>{result.objectName}</b>.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={onRescan} className="rounded-xl bg-amber-200/80 px-3 py-1.5 text-xs font-extrabold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
              Chụp / Phân tích lại
            </button>
            <button onClick={() => onExploreTopic('Khám phá')} className="rounded-xl border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
              Chọn chủ đề thủ công
            </button>
          </div>
        </div>
      )}

      {/* Scanned Before Learning Path Notification */}
      {previouslyScanned && (
        <div className="mt-5 rounded-[22px] border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/40">
          <p className="text-xs font-black uppercase text-[#1587e8]">💡 Bạn đã khám phá {result.objectName} trước đây</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Hôm nay hãy thử tìm hiểu thêm về: <b>{result.suggestedNextTopic || result.scientificTopics[0]}</b>!
          </p>
        </div>
      )}

      {/* Object Title & Confidence */}
      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#1587e8]">◉ {result.objectName}</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">{result.category}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.summary}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-extrabold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {Math.round(result.confidence * 100)}% đúng
        </span>
      </div>

      {/* Lesson Highlight Box */}
      <div className="mt-6 rounded-[26px] bg-gradient-to-br from-[#e8f7ff] to-[#f5edff] p-5 dark:from-[#123452] dark:to-[#282348]">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#1587e8]">💡 Điều gì đang xảy ra?</p>
        <p className="mt-3 text-[15px] leading-7 text-slate-700 dark:text-slate-200">
          {result.lesson.howItWorks}
        </p>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-300">
          {result.lesson.whyItWorks}
        </p>
        <button onClick={onLesson} className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-[#1587e8]">
          Tìm hiểu tại sao <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Topics Tags */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {result.scientificTopics.map((topic) => (
          <button key={topic} onClick={() => onExploreTopic(topic)} className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold dark:border-white/10 dark:bg-[#142238]">
            ⚙️ {topic}
          </button>
        ))}
      </div>

      {/* Next Step Lesson Link */}
      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Tiếp tục khám phá</h2>
        <span className="text-xs text-slate-400">3 phần bài học</span>
      </div>
      <button onClick={onLesson} className="mt-3 flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-[#142238] active:scale-98 transition">
        <span className="grid size-11 place-items-center rounded-2xl bg-amber-100 text-2xl">📐</span>
        <span className="flex-1">
          <b className="block">Tại sao {result.objectName.toLowerCase()} lại như vậy?</b>
          <small className="text-slate-400">Bài học tương tác · 5 phút</small>
        </span>
        <ChevronRight className="size-5 text-slate-400" />
      </button>
    </main>
  )
}

function LessonScreen({
  result,
  onBack,
  onExperiment
}: {
  result: AIAnalysisResult;
  onBack: () => void;
  onExperiment: () => void;
}) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('basic')

  useEffect(() => {
    setDifficulty(getDifficultyPreference())
  }, [])

  const handleDifficultyChange = (lvl: DifficultyLevel) => {
    setDifficulty(lvl)
    setDifficultyPreference(lvl)
  }

  const explanationText = result.lesson.levelExplanations?.[difficulty] || result.lesson.howItWorks

  return (
    <main className="px-5 pb-32 pt-7">
      <header className="flex items-center gap-3">
        <IconButton label="Quay lại" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <span className="font-bold">{result.objectName}</span>
      </header>

      {/* Title */}
      <div className="mt-8">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#1587e8]">Bài học 01 · {result.category}</p>
        <h1 className="mt-3 max-w-[340px] text-[37px] font-black leading-[1.02] tracking-[-.055em]">
          Nguyên lý hoạt động của {result.objectName}
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-slate-500 dark:text-slate-400">{result.summary}</p>
      </div>

      {/* Difficulty Level Switcher */}
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-2 dark:bg-[#142238]">
        {[
          ['basic', '🎒 Cơ bản'],
          ['intermediate', '📚 Trung học'],
          ['advanced', '🎓 Nâng cao']
        ].map(([lvl, label]) => (
          <button
            key={lvl}
            onClick={() => handleDifficultyChange(lvl as DifficultyLevel)}
            className={cn(
              'flex-1 rounded-xl py-2 text-xs font-extrabold transition',
              difficulty === lvl
                ? 'bg-[#1587e8] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Visual Scientific Diagram matching v0 */}
      <div className="relative mt-7 flex h-64 items-center justify-center overflow-hidden rounded-[30px] bg-[#e9f7ff] dark:bg-[#123452]">
        <div className="absolute size-48 rounded-full border-[3px] border-[#1587e8]/50" />
        <div className="absolute size-4 rounded-full bg-[#1587e8] shadow-[0_0_0_8px_rgba(21,135,232,.15)]" />
        <div className="absolute h-px w-48 bg-[#1587e8]/50" />
        <div className="absolute w-px h-48 bg-[#1587e8]/50" />
        <span className="absolute top-8 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[#1587e8] dark:bg-white/10">
          {result.scientificTopics[0] || 'Nguyên lý'}
        </span>
        <div className="absolute h-24 w-px origin-bottom rotate-45 bg-[#f2a927]" />
      </div>

      {/* Dynamic Explanation Cards */}
      <div className="mt-7 space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#142238]">
          <p className="text-xs font-black uppercase text-[#1587e8] mb-2">🔬 Giải thích mức độ {difficulty === 'basic' ? 'Cơ bản' : difficulty === 'intermediate' ? 'Trung học' : 'Nâng cao'}</p>
          <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-200">{explanationText}</p>
        </div>

        {result.lesson.interestingFact && (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
            <b>💡 Bạn có biết?</b>
            <p className="mt-1 text-xs leading-5">{result.lesson.interestingFact}</p>
          </div>
        )}

        {result.lesson.mathBehind && (
          <div className="rounded-2xl border border-sky-100 bg-[#f0f9ff] p-4 text-xs font-bold text-sky-900 dark:border-sky-900 dark:bg-[#102d45] dark:text-sky-200">
            <b>📐 Toán học phía sau:</b> {result.lesson.mathBehind}
          </div>
        )}
      </div>

      {/* Next Step Button */}
      <button onClick={onExperiment} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-[#1587e8] p-4 text-left font-extrabold text-white shadow-lg shadow-sky-200/30 active:scale-98 transition">
        <span>
          <small className="block text-xs font-semibold text-white/70">Bước tiếp theo</small>
          Thử nghiệm & Tính toán thực tế
        </span>
        <ArrowRight />
      </button>
    </main>
  )
}

function ExperimentScreen({
  result,
  onBack,
  onQuiz
}: {
  result: AIAnalysisResult;
  onBack: () => void;
  onQuiz: () => void;
}) {
  // Wheel default parameters
  const [val1, setVal1] = useState(30)
  const [val2, setVal2] = useState(10)

  // Dynamic calculations based on object type
  let calcOut1 = { label: 'Chu vi', value: '1.88', unit: 'm' }
  let calcOut2 = { label: 'Quãng đường', value: '18.85', unit: 'm' }
  let formulaText = 'Bán kính ↑  →  Chu vi ↑  →  Quãng đường mỗi vòng ↑'

  const objNameLower = result.objectName.toLowerCase()

  if (objNameLower.includes('bóng đèn') || result.calculator?.type === 'lightbulb') {
    const res = calculateLightbulbEnergy(val1, val2, 30)
    calcOut1 = { label: 'Số điện (kWh/ngày)', value: res.kWhPerDay.toString(), unit: 'kWh' }
    calcOut2 = { label: 'Tiền điện ước tính (tháng)', value: res.estimatedCostVND.toLocaleString('vi-VN'), unit: 'VND' }
    formulaText = res.formula
  } else if (objNameLower.includes('cầu thang') || result.calculator?.type === 'stair') {
    const res = calculateStairIncline(val1 * 5, val2 * 25)
    calcOut1 = { label: 'Độ dốc (Slope)', value: res.slopePercent.toString(), unit: '%' }
    calcOut2 = { label: 'Góc nghiêng (θ)', value: res.angleDegrees.toString(), unit: '°' }
    formulaText = res.formula
  } else if (objNameLower.includes('gương') || result.calculator?.type === 'mirror') {
    const res = calculateMirrorReflection(val1)
    calcOut1 = { label: 'Góc phản xạ (θ_r)', value: res.reflectionAngleDeg.toString(), unit: '°' }
    calcOut2 = { label: 'Góc đổi hướng', value: res.deviationAngleDeg.toString(), unit: '°' }
    formulaText = res.formula
  } else if (objNameLower.includes('cây') || result.calculator?.type === 'plant') {
    const res = calculatePlantPhotosynthesis(val1 * 500, val2)
    calcOut1 = { label: 'Hiệu suất quang hợp', value: res.efficiencyPercent.toString(), unit: '%' }
    calcOut2 = { label: 'Chỉ số năng lượng', value: res.energyIndex.toString(), unit: 'điểm' }
    formulaText = res.formula
  } else {
    // Default Wheel calculation
    const res = calculateWheel(val1, val2)
    calcOut1 = { label: 'Chu vi C', value: res.circumferenceM.toString(), unit: 'm' }
    calcOut2 = { label: 'Quãng đường S', value: res.totalDistanceM.toString(), unit: 'm' }
    formulaText = res.formula
  }

  return (
    <main className="px-5 pb-32 pt-7">
      <header className="flex items-center gap-3">
        <IconButton label="Quay lại" onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <span className="font-bold">Thử nghiệm & Máy tính</span>
      </header>

      <p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-[#1587e8]">Phòng thí nghiệm mini</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Toán học & Vật lý phía sau</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Thay đổi các biến số để quan sát sự thay đổi thực tế của {result.objectName}.
      </p>

      {/* Interactive Graphic Representation */}
      <div className="mt-7 flex items-center justify-center rounded-[28px] bg-[#e9f7ff] py-7 dark:bg-[#123452]">
        <div
          className="grid place-items-center rounded-full border-[10px] border-[#1587e8] bg-white text-center shadow-lg dark:bg-[#102d50] transition-all duration-300"
          style={{ width: Math.min(110 + val1, 210), height: Math.min(110 + val1, 210) }}
        >
          <span className="text-2xl">◉</span>
          <small className="text-[10px] font-bold text-slate-400">Biến: {val1}</small>
        </div>
      </div>

      {/* Sliders Input Controls */}
      <div className="mt-6 space-y-5">
        <label className="block">
          <div className="mb-2 flex justify-between text-sm font-extrabold">
            <span>Biến 1 (Kích thước / Bán kính / Công suất)</span>
            <span className="text-[#1587e8]">{val1}</span>
          </div>
          <input
            aria-label="Biến 1"
            type="range"
            min={10}
            max={70}
            value={val1}
            onChange={(e) => setVal1(Number(e.target.value))}
            className="w-full accent-[#1587e8]"
          />
        </label>

        <label className="block">
          <div className="mb-2 flex justify-between text-sm font-extrabold">
            <span>Biến 2 (Số vòng quay / Thời gian)</span>
            <span className="text-[#1587e8]">{val2}</span>
          </div>
          <input
            aria-label="Biến 2"
            type="range"
            min={1}
            max={30}
            value={val2}
            onChange={(e) => setVal2(Number(e.target.value))}
            className="w-full accent-[#1587e8]"
          />
        </label>
      </div>

      {/* Realtime Computed Outputs */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 dark:bg-[#142238]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{calcOut1.label}</p>
          <p className="mt-2 text-2xl font-black">{calcOut1.value} {calcOut1.unit}</p>
        </div>
        <div className="rounded-2xl bg-[#102d50] p-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{calcOut2.label}</p>
          <p className="mt-2 text-2xl font-black">{calcOut2.value} {calcOut2.unit}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-sky-300 p-4 text-center text-xs font-bold text-[#1587e8]">
        {formulaText}
      </div>

      <button onClick={onQuiz} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-[#1587e8] p-4 font-extrabold text-white active:scale-98 transition">
        Thử câu hỏi kiểm tra <ArrowRight />
      </button>
    </main>
  )
}

function QuizScreen({
  quizzes,
  onBack,
  onComplete
}: {
  quizzes: QuizQuestion[];
  onBack: () => void;
  onComplete: (score: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const currentQuiz = quizzes[currentIndex] || {
    id: 'fallback',
    question: 'Nếu bán kính bánh xe tăng gấp đôi, chu vi sẽ thế nào?',
    options: ['Không đổi', 'Tăng gấp đôi', 'Tăng gấp ba', 'Giảm một nửa'],
    correctAnswer: 1,
    explanation: 'Chu vi C = 2πr. Khi r tăng gấp đôi, C cũng tăng gấp đôi.'
  }

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return // Answered already
    setSelectedOption(idx)
    const isCorrect = idx === currentQuiz.correctAnswer
    if (isCorrect) setScore((prev) => prev + 1)
    recordQuizAnswer(isCorrect)
  }

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
    } else {
      onComplete(score + (selectedOption === currentQuiz.correctAnswer ? 0 : 0))
    }
  }

  return (
    <main className="px-5 pb-32 pt-7">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton label="Quay lại" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <span className="font-bold">Kiểm tra nhanh</span>
        </div>
        <span className="rounded-full bg-[#dff4ff] px-3 py-1 text-xs font-black text-[#1587e8]">
          {currentIndex + 1} / {Math.max(quizzes.length, 1)}
        </span>
      </header>

      {/* Progress Bar */}
      <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[#1587e8] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / Math.max(quizzes.length, 1)) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#efe9ff] text-2xl">🧠</span>
        <h1 className="mt-5 text-[26px] font-black leading-tight tracking-tight">{currentQuiz.question}</h1>
      </div>

      {/* Options List */}
      <div className="mt-8 flex flex-col gap-3">
        {currentQuiz.options.map((answer, i) => {
          const isSelected = selectedOption === i
          const isCorrect = i === currentQuiz.correctAnswer

          let buttonStyle = 'border-slate-200 bg-white hover:border-[#1587e8] dark:border-white/10 dark:bg-[#142238]'
          if (selectedOption !== null) {
            if (isCorrect) {
              buttonStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
            } else if (isSelected) {
              buttonStyle = 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
            }
          }

          return (
            <button
              key={answer}
              onClick={() => handleSelectOption(i)}
              className={cn('flex items-center gap-4 rounded-2xl border p-4 text-left text-sm font-bold transition', buttonStyle)}
            >
              <span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-xs dark:bg-white/10">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{answer}</span>
              {selectedOption !== null && isCorrect && <Check className="ml-auto size-5 text-emerald-600" />}
            </button>
          )
        })}
      </div>

      {/* Explanation Box */}
      {selectedOption !== null && (
        <div
          className={cn(
            'mt-6 rounded-2xl p-4 text-sm leading-6 transition-all',
            selectedOption === currentQuiz.correctAnswer
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
          )}
        >
          <b className="block text-base">
            {selectedOption === currentQuiz.correctAnswer ? '🎉 Chính xác!' : '💡 Chưa đúng.'}
          </b>
          {currentQuiz.explanation}
        </div>
      )}

      <button onClick={handleNext} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-[#1587e8] p-4 font-extrabold text-white active:scale-98 transition">
        {currentIndex < quizzes.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài học'} <ArrowRight />
      </button>
    </main>
  )
}

function CompleteScreen({
  result,
  score,
  totalQuizzes,
  onScan,
  onReview
}: {
  result: AIAnalysisResult;
  score: number;
  totalQuizzes: number;
  onScan: () => void;
  onReview: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 text-center">
      <div className="grid size-24 place-items-center rounded-[30px] bg-gradient-to-br from-[#fff0bf] to-[#eadcff] text-5xl shadow-lg">✨</div>
      <p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-[#1587e8]">Khám phá hoàn tất</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">Bạn đã hiểu<br />một điều mới.</h1>
      
      <div className="mt-8 w-full rounded-[26px] bg-white p-5 text-left dark:bg-[#142238]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">◉</span>
          <b className="text-lg">{result.objectName}</b>
        </div>
        <p className="mt-5 text-sm font-bold text-slate-500">Bạn vừa học được các chủ đề:</p>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {result.scientificTopics.map((topic) => (
            <li key={topic}>✓ {topic}</li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#e9f7ff] p-3 text-sm font-extrabold text-[#1587e8] dark:bg-[#123452]">
          <span>🧠 Kết quả Quiz</span>
          <span>{score} / {Math.max(totalQuizzes, 1)} đúng</span>
        </div>
      </div>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <button onClick={onScan} className="rounded-2xl bg-[#1587e8] p-4 text-sm font-extrabold text-white active:scale-95 transition">
          Khám phá vật khác
        </button>
        <button onClick={onReview} className="rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-white/10 active:scale-95 transition">
          Xem lại bài học
        </button>
      </div>
    </main>
  )
}

function PrivacyModal({ onClose, onKeySaved }: { onClose: () => void; onKeySaved?: () => void }) {
  const [userApiKey, setUserApiKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [validating, setValidating] = useState(false)
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('snapscience_gemini_api_key') || localStorage.getItem('snapscience_user_api_key') || ''
      setUserApiKey(savedKey)
    }
  }, [])

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      const cleanKey = userApiKey.trim()
      localStorage.setItem('snapscience_gemini_api_key', cleanKey)
      localStorage.setItem('snapscience_user_api_key', cleanKey)
      setIsSaved(true)
      onKeySaved?.()
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const handleTestKey = async () => {
    setValidating(true)
    setTestResult(null)
    const res = await validateGeminiApiKey(userApiKey)
    setValidating(false)
    setTestResult(res)
  }

  const hasKey = Boolean(userApiKey.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-[#10233f] dark:bg-[#142238] dark:text-white shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-[#1587e8]" />
            <h2 className="text-xl font-black">Cài đặt API & Bảo mật</h2>
          </div>
          <IconButton label="Đóng" onClick={onClose}><X /></IconButton>
        </div>

        {/* Current Active Mode Badge */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 dark:border-white/10 dark:bg-white/5">
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">Trạng thái hệ thống:</span>
          <ModeBadge hasUserApiKey={hasKey} />
        </div>

        <div className="mt-4 space-y-4 text-xs leading-5 text-slate-600 dark:text-slate-300">
          {/* Custom Gemini API Key Config Box */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/40">
            <div className="flex items-center justify-between">
              <b className="block text-sky-900 dark:text-sky-300 text-sm font-black">🔑 Google Gemini AI Key (MIỄN PHÍ 100%)</b>
            </div>
            <p className="mt-1 text-xs leading-5">
              Nhập <b>Google Gemini API Key</b> của bạn để AI nhận diện chính xác 100% bất kỳ vật thể nào (Con chuột máy tính, Đèn bàn, Quạt, Bàn phím...):
            </p>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-bold text-[#1587e8] underline hover:text-sky-700 text-[11px]"
            >
              👉 Lấy Gemini API Key Miễn Phí Tại aistudio.google.com <ExternalLink className="size-3" />
            </a>

            <div className="mt-3 flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={userApiKey}
                onChange={(e) => { setUserApiKey(e.target.value); setTestResult(null); }}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-[#1587e8] focus:outline-none dark:border-white/20 dark:bg-[#10233f] dark:text-white"
              />
              <button
                onClick={handleSaveKey}
                className="rounded-xl bg-[#1587e8] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 active:scale-95 transition"
              >
                {isSaved ? '✓ Đã lưu' : 'Lưu Key'}
              </button>
              <button
                onClick={handleTestKey}
                disabled={validating || !userApiKey}
                className="rounded-xl border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:bg-[#142238] dark:text-sky-300 dark:border-sky-700 disabled:opacity-50"
              >
                {validating ? 'Đang test...' : '⚡ Test Key'}
              </button>
            </div>

            {/* Validation Feedback Status */}
            {testResult && (
              <div className="mt-3 rounded-xl p-2.5 text-xs font-semibold leading-5">
                {testResult.valid ? (
                  <p className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ✓ Gemini Key hợp lệ! Đã kích hoạt Gemini AI Vision THẬT 100%.
                  </p>
                ) : (
                  <p className="text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                    <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>❌ Key bị lỗi: <b>{testResult.error}</b>. (Hãy kiểm tra lại key lấy từ aistudio.google.com).</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-950/40">
            <b className="block text-sky-900 dark:text-sky-300 text-sm">📷 Camera trên thiết bị</b>
            Camera chỉ được mở khi bạn nhấn "Chụp" hoặc vào màn hình quét. Không bao giờ tự động bật camera ngầm.
          </div>

          <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <b className="block text-emerald-900 dark:text-emerald-300 text-sm">🔒 Dữ liệu & Ảnh chụp</b>
            Ảnh chụp chỉ được gửi tới API server an toàn khi bạn bấm "Phân tích ảnh". Ảnh lịch sử được lưu trực tiếp trên thiết bị của bạn.
          </div>

          <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-950/40">
            <b className="block text-amber-900 dark:text-amber-300 text-sm">🔑 Demo Mode & Offline</b>
            Nếu chưa cấu hình Gemini key hoặc mất mạng, ứng dụng tự động chạy ở Demo Mode dữ liệu mẫu local để trải nghiệm không bị ngắt quãng.
          </div>
        </div>

        <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-[#1587e8] py-3 text-sm font-extrabold text-white">
          Tôi đã hiểu & Đồng ý
        </button>
      </div>
    </div>
  )
}

function LibraryScreen({
  tab,
  onSelectTopic,
  onSelectHistoryItem,
  historyItems,
  onClearHistory,
  onDeleteHistoryItem,
  progress
}: {
  tab: Tab;
  onSelectTopic: (topic: string) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  historyItems: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  progress: UserProgress;
}) {
  const [active, setActive] = useState('Tất cả')

  const topics = ['Tất cả', 'Vật lý', 'Hóa học', 'Sinh học', 'Toán', 'Điện', 'Cơ khí', 'Môi trường']

  if (tab === 'discover') {
    return (
      <main className="px-5 pb-32 pt-7">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">🔬 Khám phá</h1>
          <IconButton label="Menu"><Menu /></IconButton>
        </header>
        
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-400 dark:bg-[#142238]">
          <Search className="size-5" />
          <span className="text-sm">Bạn muốn tìm hiểu chủ đề gì?</span>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setActive(topic)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition',
                active === topic ? 'bg-[#1587e8] text-white' : 'bg-white text-slate-500 dark:bg-[#142238]'
              )}
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {[
            ['🌈', 'Tại sao cầu vồng có nhiều màu?', 'Quang học - Tán sắc ánh sáng'],
            ['🪞', 'Tại sao bạn nhìn thấy mình trong gương?', 'Quang học - Phản xạ ánh sáng'],
            ['💡', 'Điện năng biến thành gì trong bóng đèn?', 'Điện năng & Quang năng'],
            ['🌱', 'Cây xanh hấp thụ ánh sáng ra sao?', 'Sinh học - Quang hợp'],
            ['◉', 'Bánh xe giúp di chuyển nhẹ hơn thế nào?', 'Cơ học - Chuyển động quay'],
            ['📐', 'Cầu thang hoạt động như máy cơ nào?', 'Cơ học - Mặt phẳng nghiêng']
          ].map(([icon, title, topic]) => (
            <button
              key={title}
              onClick={() => onSelectTopic(title)}
              className="flex items-center gap-4 rounded-[24px] bg-white p-4 text-left shadow-sm dark:bg-[#142238] active:scale-98 transition"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#f2f5fa] text-3xl dark:bg-white/10">{icon}</span>
              <span className="flex-1">
                <b className="block text-base">{title}</b>
                <small className="mt-1 block text-xs font-bold text-[#1587e8]">{topic}</small>
              </span>
              <ChevronRight className="size-5 text-slate-400" />
            </button>
          ))}
        </div>
      </main>
    )
  }

  if (tab === 'learn') {
    return (
      <main className="px-5 pb-32 pt-7">
        <h1 className="text-3xl font-black tracking-tight">📚 Học</h1>
        <p className="mt-2 text-sm text-slate-500">Mỗi ngày một điều mới.</p>
        
        <section className="mt-7 rounded-[26px] bg-[#102d50] p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-cyan-300">TIẾP TỤC HỌC</p>
              <h2 className="mt-2 text-2xl font-black">Ánh sáng & Quang học</h2>
              <p className="mt-1 text-sm text-slate-300">3 / 5 bài hoàn thành</p>
            </div>
            <span className="text-4xl">🌈</span>
          </div>
          <div className="mt-6 h-2 rounded-full bg-white/20">
            <div className="h-full w-3/5 rounded-full bg-cyan-300" />
          </div>
        </section>

        <h2 className="mt-8 text-lg font-extrabold">Chủ đề phổ biến</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            ['⚡', 'Điện năng'],
            ['🌈', 'Ánh sáng'],
            ['🌀', 'Chuyển động'],
            ['🌱', 'Sinh học'],
            ['📐', 'Toán học'],
            ['🌍', 'Môi trường']
          ].map(([icon, name]) => (
            <button
              key={name}
              onClick={() => onSelectTopic(name)}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left font-extrabold dark:bg-[#142238] active:scale-95 transition"
            >
              <span className="text-2xl">{icon}</span>
              {name}
            </button>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="px-5 pb-32 pt-7">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">🕘 Khám phá của bạn</h1>
        {historyItems.length > 0 && (
          <button onClick={onClearHistory} className="text-xs font-bold text-rose-500 hover:underline">
            Xóa lịch sử
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          [progress.objectsDiscovered.toString(), 'vật thể'],
          [progress.topicsLearned.toString(), 'chủ đề'],
          [progress.questionsAnswered.toString(), 'câu hỏi']
        ].map(([n, l]) => (
          <div key={l} className="rounded-2xl bg-white p-4 dark:bg-[#142238]">
            <b className="text-2xl font-black">{n}</b>
            <p className="mt-1 text-[11px] font-bold text-slate-400">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {historyItems.length > 0 ? (
          historyItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-[#142238]">
              <button
                onClick={() => onSelectHistoryItem(item)}
                className="flex flex-1 items-center gap-4 text-left"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-xl overflow-hidden dark:bg-sky-900/40">
                  {item.imageUri ? (
                    <img src={item.imageUri} alt={item.objectName} className="size-full object-cover" />
                  ) : (
                    '◉'
                  )}
                </span>
                <span className="flex-1">
                  <b className="block font-extrabold">{item.objectName}</b>
                  <small className="text-xs text-slate-400">{item.category} · {new Date(item.timestamp).toLocaleDateString('vi-VN')}</small>
                </span>
              </button>
              <IconButton label="Xóa" onClick={() => onDeleteHistoryItem(item.id)} className="text-slate-400 hover:text-rose-500">
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-white/10 dark:bg-[#142238]">
            <p className="font-bold text-sm">Chưa có lịch sử khám phá nào.</p>
            <p className="mt-1 text-xs">Ảnh và kết quả phân tích sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function Page() {
  const [flow, setFlow] = useState<Flow>('home')
  const [tab, setTab] = useState<Tab>('home')

  // Real App States
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [demoObjectName, setDemoObjectName] = useState<string>('')
  const [currentResult, setCurrentResult] = useState<AIAnalysisResult>(MOCK_DATABASE['bánh xe'])
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)
  const [analysisApiError, setAnalysisApiError] = useState<string | undefined>(undefined)
  const [previouslyScanned, setPreviouslyScanned] = useState<HistoryItem | undefined>(undefined)
  const [quizScore, setQuizScore] = useState<number>(0)
  const [hasUserApiKey, setHasUserApiKey] = useState<boolean>(false)

  // Local Persistent Data
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress>({
    objectsDiscovered: 0,
    topicsLearned: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    discoveredObjectsList: [],
    learnedTopicsList: [],
    difficultyPreference: 'basic'
  })
  const [dailyDiscovery, setDailyDiscovery] = useState<DailyDiscovery>({
    date: 'default',
    title: 'Tại sao cầu vồng có nhiều màu?',
    description: 'Tìm một vật hoặc hiện tượng liên quan đến ánh sáng.',
    topic: 'Quang học',
    icon: '🌈',
    objectHint: 'Ly nước'
  })
  useEffect(() => {
    setHistoryItems(getHistory())
    setUserProgress(getUserProgress())
    setDailyDiscovery(getDailyDiscovery())
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('snapscience_gemini_api_key') || localStorage.getItem('snapscience_user_api_key') || ''
      setHasUserApiKey(storedKey.trim().length > 10)
    }
  }, [flow])

  const goTab = (next: Tab) => {
    setTab(next)
    setFlow(next === 'home' ? 'home' : (next as Flow))
  }

  // Handle image capture from camera or file
  const handleCaptureImage = (imgUri: string) => {
    setCapturedImage(imgUri)
    setDemoObjectName('')
    setFlow('preview')
  }

  // Handle demo object selection
  const handleSelectDemoObject = (objName: string) => {
    setDemoObjectName(objName)
    setCapturedImage('')
    setFlow('preview')
  }

  // Handle analysis completion
  const handleAnalysisDone = (result: AIAnalysisResult, isDemo: boolean, apiError?: string) => {
    setCurrentResult(result)
    setIsDemoMode(isDemo)
    setAnalysisApiError(apiError)

    // Check if previously scanned
    const prev = checkIfPreviouslyScanned(result.objectName)
    setPreviouslyScanned(prev)

    // Save to history persistence if valid analysis
    if (!apiError) {
      const newItem: HistoryItem = {
        id: result.id || `hist_${Date.now()}`,
        timestamp: Date.now(),
        imageUri: capturedImage,
        objectName: result.objectName,
        category: result.category,
        confidence: result.confidence,
        summary: result.summary,
        scientificTopics: result.scientificTopics,
        fullResult: result
      }

      const updatedHistory = saveHistoryItem(newItem)
      setHistoryItems(updatedHistory)
      setUserProgress(getUserProgress())
    }

    setFlow('result')
  }

  // Select item from history to review
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentResult(item.fullResult || MOCK_DATABASE[item.objectName.toLowerCase()] || MOCK_DATABASE['bánh xe'])
    setCapturedImage(item.imageUri)
    setIsDemoMode(false)
    setAnalysisApiError(undefined)
    setPreviouslyScanned(undefined)
    setFlow('result')
  }

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử khám phá?')) {
      const updated = clearHistory()
      setHistoryItems(updated)
      setUserProgress(getUserProgress())
    }
  }

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id)
    setHistoryItems(updated)
    setUserProgress(getUserProgress())
  }

  const handleSelectTopicFromDiscover = (topicHint?: string) => {
    const matchedKey = Object.keys(MOCK_DATABASE).find(k => (topicHint || '').toLowerCase().includes(k)) || 'bánh xe'
    handleSelectDemoObject(matchedKey)
  }

  // Render screens
  if (flow === 'camera') {
    return (
      <CameraScreen
        onBack={() => setFlow('home')}
        onCaptureImage={handleCaptureImage}
        onSelectDemoObject={handleSelectDemoObject}
      />
    )
  }

  if (flow === 'preview') {
    return (
      <PreviewScreen
        capturedImage={capturedImage}
        onBack={() => setFlow('camera')}
        onAnalyze={() => setFlow('analyzing')}
      />
    )
  }

  if (flow === 'analyzing') {
    return (
      <AnalyzingScreen
        capturedImage={capturedImage}
        demoObjectName={demoObjectName}
        onDone={handleAnalysisDone}
      />
    )
  }

  if (flow === 'result') {
    return (
      <AppShell tab={tab} setTab={goTab} onScan={() => setFlow('camera')}>
        <ResultScreen
          result={currentResult}
          capturedImage={capturedImage}
          isDemo={isDemoMode}
          apiError={analysisApiError}
          previouslyScanned={previouslyScanned}
          onBack={() => setFlow('home')}
          onLesson={() => setFlow('lesson')}
          onRescan={() => setFlow('camera')}
          onExploreTopic={handleSelectTopicFromDiscover}
          onOpenPrivacy={() => setFlow('privacy')}
        />
      </AppShell>
    )
  }

  if (flow === 'lesson') {
    return (
      <AppShell tab={tab} setTab={goTab} onScan={() => setFlow('camera')}>
        <LessonScreen
          result={currentResult}
          onBack={() => setFlow('result')}
          onExperiment={() => setFlow('experiment')}
        />
      </AppShell>
    )
  }

  if (flow === 'experiment') {
    return (
      <AppShell tab={tab} setTab={goTab} onScan={() => setFlow('camera')}>
        <ExperimentScreen
          result={currentResult}
          onBack={() => setFlow('lesson')}
          onQuiz={() => setFlow('quiz')}
        />
      </AppShell>
    )
  }

  if (flow === 'quiz') {
    return (
      <AppShell tab={tab} setTab={goTab} onScan={() => setFlow('camera')}>
        <QuizScreen
          quizzes={currentResult.quizzes || []}
          onBack={() => setFlow('experiment')}
          onComplete={(finalScore) => {
            setQuizScore(finalScore)
            setFlow('complete')
          }}
        />
      </AppShell>
    )
  }

  if (flow === 'complete') {
    return (
      <AppShell tab={tab} setTab={goTab} onScan={() => setFlow('camera')}>
        <CompleteScreen
          result={currentResult}
          score={quizScore}
          totalQuizzes={currentResult.quizzes?.length || 1}
          onScan={() => setFlow('camera')}
          onReview={() => setFlow('lesson')}
        />
      </AppShell>
    )
  }

  return (
    <AppShell tab={tab} setTab={goTab} onScan={() => setFlow('camera')}>
      {flow === 'privacy' && <PrivacyModal onClose={() => setFlow('home')} />}
      {flow === 'home' ? (
        <HomeScreen
          onScan={() => setFlow('camera')}
          onExplore={handleSelectTopicFromDiscover}
          onOpenPrivacy={() => setFlow('privacy')}
          onSelectHistoryItem={handleSelectHistoryItem}
          progress={userProgress}
          historyItems={historyItems}
          dailyDiscovery={dailyDiscovery}
          hasUserApiKey={hasUserApiKey}
        />
      ) : (
        <LibraryScreen
          tab={tab}
          onSelectTopic={handleSelectTopicFromDiscover}
          onSelectHistoryItem={handleSelectHistoryItem}
          historyItems={historyItems}
          onClearHistory={handleClearHistory}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          progress={userProgress}
        />
      )}
    </AppShell>
  )
}
