import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle2, Scan, ArrowRight, ArrowLeft } from "lucide-react"
import { getVisit, checkinVisit, checkoutVisit, getAuthToken, getApiBase } from "@/lib/api"
import { Html5Qrcode } from "html5-qrcode"

type QRScannerMode = "checkin" | "checkout"

/** Extract sessionId from QR payload - supports JSON, plain sessionId, or URL with ?id= */
function extractSessionId(raw: string): string {
  // Try base64 JSON (badge generator format)
  try {
    const bin = atob(raw)
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const data = JSON.parse(json)
    if (data.sessionId) return data.sessionId
  } catch {
    // not base64 JSON
  }
  // Try URL params (visitor-pass?id=VMS-123 or similar)
  try {
    const url = new URL(raw)
    const id = url.searchParams.get("id") || url.searchParams.get("sessionId")
    if (id) return id
    // Path segment: /visitor-pass/VMS-123 or /visits/pass/VMS-123
    const match = raw.match(/\/(?:visitor-pass|visits\/pass)\/([A-Za-z0-9-]+)/)
    if (match) return match[1]
  } catch {
    // not a URL
  }
  // Plain sessionId (VMS-NNNNNN or UUID)
  return raw.trim()
}

// Zebra DS9300 scanner sends input as keyboard events
// Characters arrive rapidly followed by Enter key
// Camera scanning uses html5-qrcode

export function QRScanner(props: {
  mode?: QRScannerMode
  onBack?: () => void
  onCheckedIn?: (sessionId: string) => void
  onCheckedOut?: (sessionId: string) => void
}) {
  const mode = props.mode ?? "checkout"
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<string | null>(null)
  const [autoProcessing, setAutoProcessing] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const html5QrRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-scanner-viewfinder"

  // Buffer for Zebra scanner input
  const inputBufferRef = useRef("")
  const lastKeystrokeRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startScan = useCallback(() => {
    setScanning(true)
    setResult(null)
    setCameraError(null)
    inputBufferRef.current = ""
  }, [])

  const onScanSuccess = async () => {
    if (!result) return
    if (mode === "checkout") {
      if (getApiBase() && getAuthToken()) {
        try {
          await checkoutVisit(result)
          toast.success("Visitor checked out successfully")
          props.onCheckedOut?.(result)
          return
        } catch (e) {
          toast.error("Check-out failed", { description: (e as Error).message })
          return
        }
      }
      toast.success("Visitor checked out")
    } else {
      if (getApiBase() && getAuthToken() && props.onCheckedIn) {
        try {
          await checkinVisit(result)
          props.onCheckedIn(result)
          return
        } catch (e) {
          toast.error("Check-in failed", { description: (e as Error).message })
          return
        }
      }
      toast.success("Visitor verified", { description: "Check-in confirmed." })
    }
    setResult(null)
    setScanning(false)
  }

  const decodePayload = useCallback(
    async (raw: string) => {
      const sessionId = extractSessionId(raw)

      const runAutoCheckIn = () =>
        mode === "checkin" && props.onCheckedIn && !!getApiBase() && !!getAuthToken()
      const runAutoCheckOut = () =>
        mode === "checkout" && props.onCheckedOut && !!getApiBase() && !!getAuthToken()

      // Auto check-in: call API and immediately show CheckInBadge template
      if (runAutoCheckIn()) {
        setAutoProcessing(true)
        try {
          await checkinVisit(sessionId)
          props.onCheckedIn!(sessionId) // navigates to CheckInBadge
        } catch (e) {
          setAutoProcessing(false)
          toast.error("Check-in failed", { description: (e as Error).message })
          startScan()
        }
        return
      }

      // Auto check-out: call API and show CheckOutBadge template
      if (runAutoCheckOut()) {
        setAutoProcessing(true)
        try {
          await checkoutVisit(sessionId)
          props.onCheckedOut!(sessionId) // navigates to CheckOutBadge
        } catch (e) {
          setAutoProcessing(false)
          toast.error("Check-out failed", { description: (e as Error).message })
          startScan()
        }
        return
      }

      // Manual flow: show Verify + Confirm
      let visitorName: string | undefined
      const configRaw = sessionStorage.getItem("vms_config")
      const config = configRaw ? JSON.parse(configRaw) : {}
      if (config.apiBase && getAuthToken()) {
        try {
          const visit = await getVisit(sessionId)
          visitorName = visit.visitor?.name
        } catch {
          /* use sessionId */
        }
      }
      setResult(sessionId)
      toast.success("Verified", { description: visitorName || sessionId })
    },
    [mode, props.onCheckedIn, props.onCheckedOut, startScan]
  )

  // Process buffered Zebra scanner input
  const processBuffer = useCallback(() => {
    const data = inputBufferRef.current.trim()
    if (data.length > 0) {
      setScanning(false)
      decodePayload(data)
    }
    inputBufferRef.current = ""
  }, [decodePayload])

  // Zebra keyboard listener
  useEffect(() => {
    if (!scanning || result || useCamera) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (e.key === "Enter") {
        e.preventDefault()
        processBuffer()
        return
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const timeSinceLastKey = now - lastKeystrokeRef.current
        if (timeSinceLastKey > 500 && inputBufferRef.current.length > 0) {
          inputBufferRef.current = ""
        }
        inputBufferRef.current += e.key
        lastKeystrokeRef.current = now
        timeoutRef.current = setTimeout(() => {
          if (inputBufferRef.current.length >= 3) processBuffer()
        }, 100)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [scanning, result, useCamera, processBuffer])

  // Camera scanning with html5-qrcode
  useEffect(() => {
    if (!useCamera || !scanning || result) return

    const startCamera = async () => {
      try {
        const html5Qr = new Html5Qrcode(scannerDivId)
        html5QrRef.current = html5Qr

        await html5Qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Stop immediately to prevent duplicate scans
            html5Qr
              .stop()
              .then(() => {
                html5QrRef.current = null
                setScanning(false)
                decodePayload(decodedText)
              })
              .catch(() => {})
          },
          () => {}
        )
      } catch (err) {
        setCameraError(err instanceof Error ? err.message : "Camera access denied")
        setUseCamera(false)
      }
    }

    startCamera()
    return () => {
      html5QrRef.current?.stop().catch(() => {})
      html5QrRef.current = null
    }
  }, [useCamera, scanning, result, decodePayload])

  const titleText =
    mode === "checkin" ? "Check In — Scan QR Code" : "Check Out — Scan QR Code"

  return (
    <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Header matching dashboard style */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Scan className="h-7 w-7" />
            {titleText}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Use camera or Zebra scanner • Auto check-in on scan when logged in
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner area */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300">
            {autoProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="mt-4 text-lg font-semibold text-slate-700">
                  Verifying and showing badge...
                </p>
                <p className="text-sm text-slate-500">One moment</p>
              </div>
            ) : useCamera ? (
              <div id={scannerDivId} className="w-full h-full [&_video]:object-cover" />
            ) : scanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
                  <Scan className="h-12 w-12 text-blue-600" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-700">
                  Ready to Scan
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Zebra scanner active • Or use camera below
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Scanner active
                </div>
              </div>
            ) : result ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <p className="mt-3 text-lg font-semibold text-green-800">
                  Scan Successful
                </p>
                <p className="text-sm font-mono text-slate-600 mt-1 bg-white/70 px-3 py-1 rounded">
                  {result}
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Scan className="h-12 w-12 text-slate-400" />
                <p className="mt-3 text-slate-500">Start scanning below</p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
              {cameraError}
            </p>
          )}

          <div className="space-y-3">
            {!result && (
              <div className="flex gap-3">
                {!useCamera ? (
                  <Button
                    onClick={() => {
                      setUseCamera(true)
                      startScan()
                    }}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 rounded-xl border-2"
                  >
                    Use Camera
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      html5QrRef.current?.stop().catch(() => {})
                      setUseCamera(false)
                      startScan()
                    }}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 rounded-xl border-2"
                  >
                    Use Zebra
                  </Button>
                )}
                {!scanning && (
                  <Button
                    onClick={startScan}
                    size="lg"
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                  >
                    <Scan className="mr-2 h-5 w-5" /> Start
                  </Button>
                )}
              </div>
            )}

            {result && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <Button
                  onClick={onScanSuccess}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  {mode === "checkout" ? "Clock Out Visitor" : "Confirm Check-in"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null)
                    startScan()
                  }}
                  size="lg"
                  className="w-full h-12 rounded-xl"
                >
                  <Scan className="mr-2 h-5 w-5" /> Scan Another
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                html5QrRef.current?.stop().catch(() => {})
                setUseCamera(false)
                ;(props.onBack ?? (() => { window.location.href = "/" }))()
              }}
              className="w-full h-12 text-slate-500 hover:text-slate-700 gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
