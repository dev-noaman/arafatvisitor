import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle2, Scan, ArrowRight, ArrowLeft } from "lucide-react"
import { getVisit, checkoutVisit, getAuthToken } from "@/lib/api"

type QRScannerMode = "checkin" | "checkout"

// Zebra DS9300 scanner sends input as keyboard events
// Characters arrive rapidly followed by Enter key

export function QRScanner(props: { mode?: QRScannerMode; onBack?: () => void }) {
  const mode = props.mode ?? "checkout"
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<string | null>(null)

  // Buffer for scanner input
  const inputBufferRef = useRef("")
  const lastKeystrokeRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  const startScan = () => {
    setScanning(true)
    setResult(null)
    inputBufferRef.current = ""
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

  const decodePayload = useCallback(async (raw: string) => {
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
  }, [])

  // Process the buffered scanner input
  const processBuffer = useCallback(() => {
    const data = inputBufferRef.current.trim()
    if (data.length > 0) {
      setScanning(false)
      decodePayload(data)
    }
    inputBufferRef.current = ""
  }, [decodePayload])

  // Listen for keyboard events from Zebra DS9300 scanner
  useEffect(() => {
    if (!scanning || result) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()

      // Clear timeout on each keystroke
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // If Enter key is pressed, process the buffer
      if (e.key === "Enter") {
        e.preventDefault()
        processBuffer()
        return
      }

      // Only capture printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Check if this is rapid input (scanner) vs normal typing
        const timeSinceLastKey = now - lastKeystrokeRef.current

        // If too much time passed, this might be a new scan - clear buffer
        if (timeSinceLastKey > 500 && inputBufferRef.current.length > 0) {
          inputBufferRef.current = ""
        }

        inputBufferRef.current += e.key
        lastKeystrokeRef.current = now

        // Set timeout to process buffer if no Enter key comes
        timeoutRef.current = window.setTimeout(() => {
          if (inputBufferRef.current.length >= 3) {
            processBuffer()
          }
        }, 100)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [scanning, result, processBuffer])

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
            <div className="text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                <Scan className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground">
                Ready to Scan
              </p>
              <p className="text-sm text-muted-foreground">
                Present the QR code to the Zebra scanner
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Scanner active
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Scan className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {result ? "QR Code detected successfully" : "Click 'Start Scanning' to activate the scanner"}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {!scanning && !result && (
            <Button
              onClick={startScan}
              size="lg"
              className="w-full h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
            >
              <Scan className="mr-2 h-5 w-5" /> Start Scanning
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
