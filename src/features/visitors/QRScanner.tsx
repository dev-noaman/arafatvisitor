import { useState, useRef, useEffect } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Camera, CheckCircle2, Scan, ArrowRight, ArrowLeft } from "lucide-react"
import jsQR from "jsqr"
import { getVisit, checkoutVisit, getAuthToken } from "@/lib/api"

type QRScannerMode = "checkin" | "checkout"

export function QRScanner(props: { mode?: QRScannerMode; onBack?: () => void }) {
  const mode = props.mode ?? "checkout"
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  // Ref to track if we're currently processing a frame to avoid overlapping
  const processingRef = useRef(false)

  const startScan = () => {
    setScanning(true)
    setResult(null)
    setCameraError(false)
  }

  const onScanSuccess = async () => {
    if (!result) return
    const configRaw = sessionStorage.getItem("vms_config")
    const config = configRaw ? JSON.parse(configRaw) : {}
    if (mode === "checkout") {
      if (config.apiBase && getAuthToken()) {
        try {
          await checkoutVisit(result)
          toast.success("Visitor checked out successfully")
        } catch (e) {
          toast.error("Check-out failed", { description: (e as Error).message })
          return
        }
      } else {
        toast.success("Visitor checked out")
      }
    } else {
      toast.success("Visitor verified", { description: "Check-in confirmed." })
    }
    setResult(null)
    setScanning(false)
  }

  const decodePayload = async (raw: string) => {
    try {
      let sessionId: string
      let visitorName: string | undefined
      try {
        const bin = atob(raw)
        const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
        const json = new TextDecoder().decode(bytes)
        const data = JSON.parse(json)
        sessionId = data.sessionId || raw
        visitorName = data.visitor?.name
      } catch {
        sessionId = raw
      }
      const configRaw = sessionStorage.getItem("vms_config")
      const config = configRaw ? JSON.parse(configRaw) : {}
      if (config.apiBase && getAuthToken()) {
        try {
          const visit = await getVisit(sessionId)
          visitorName = visit.visitor?.name
        } catch {
          // use sessionId and visitorName from QR
        }
      }
      setResult(sessionId)
      toast.success("Verified", { description: visitorName || sessionId })
    } catch {
      setResult(raw)
      toast.success("QR Scanned")
    }
  }

  // Effect to run the scanning loop using jsQR
  useEffect(() => {
    if (!scanning || result) return

    let animationFrameId: number

    const scan = () => {
      if (!scanning || result) return

      const video = webcamRef.current?.video
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && !processingRef.current) {
        processingRef.current = true
        try {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            })

            if (code) {
              setScanning(false)
              decodePayload(code.data)
              processingRef.current = false
              return // Stop loop
            }
          }
        } catch (e) {
          console.error("Scan error:", e)
        }
        processingRef.current = false
      }

      animationFrameId = requestAnimationFrame(scan)
    }

    // Start scanning
    scan()

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [scanning, result])

  const titleText = mode === "checkin" ? "Scan QR Code (Check In)" : "Scan QR Code (Check Out)"

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
          <Scan className="h-6 w-6 text-primary" />
          {titleText}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-full aspect-[3/4] mx-auto overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center">
          {scanning ? (
            <div className="relative w-full h-full">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  facingMode: "environment"
                }}
                onUserMedia={() => setCameraError(false)}
                onUserMediaError={(e) => {
                  console.error("Camera error", e)
                  setCameraError(true)
                  toast.error("Camera access failed")
                }}
              />
              <div className="absolute inset-0 border-4 border-primary/50 animate-pulse pointer-events-none" />
            </div>
          ) : (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Scan className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {result ? "QR Code detected successfully" : "Position the QR code within the frame to scan automatically"}
              </p>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
            Camera access failed. Please ensure permissions are granted.
          </div>
        )}

        <div className="space-y-3">
          {!scanning && !result && (
            <Button
              onClick={startScan}
              size="lg"
              className="w-full h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
            >
              <Camera className="mr-2 h-5 w-5" /> Activate Camera
            </Button>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-center font-medium text-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5" />
                  Scan Successful
                </div>
                <div className="text-sm opacity-90 font-mono bg-white/50 py-1 px-2 rounded mt-2 inline-block">
                  {result}
                </div>
              </div>
              <div className="grid gap-3">
                <Button
                  onClick={onScanSuccess}
                  className="w-full h-14 text-lg font-medium shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
                >
                  {mode === "checkout" ? "Clock Out Visitor" : "Confirm Check-in"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    startScan();
                  }}
                  className="w-full h-14 text-lg font-medium border-2 hover:bg-accent transition-all active:scale-95 touch-manipulation"
                >
                  <Scan className="mr-2 h-5 w-5" /> Scan Another
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={props.onBack ?? (() => { window.location.href = "/" })}
            className="w-full h-12 text-muted-foreground hover:text-foreground touch-manipulation gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
