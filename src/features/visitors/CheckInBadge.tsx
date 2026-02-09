import { useState, useEffect, useRef } from "react"
import { getVisitPass } from "@/lib/api"

interface VisitData {
  sessionId: string
  visitor: { name: string; company?: string }
  host?: { name?: string; company?: string }
  purpose?: string
  location?: string
  checkInTimestamp?: string
}

function formatLocation(loc: string): string {
  if (loc === "BARWA_TOWERS") return "Barwa Towers"
  if (loc === "MARINA_50") return "Marina 50"
  if (loc === "ELEMENT_MARIOTT") return "Element Mariott"
  return loc
}

function formatTime(ts?: string): string {
  if (!ts) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function CheckInBadge({ sessionId, onComplete }: { sessionId: string; onComplete: () => void }) {
  const [visit, setVisit] = useState<VisitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    getVisitPass(sessionId)
      .then((data) => {
        setVisit(data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId])

  useEffect(() => {
    if (loading) return

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          onCompleteRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-lg text-slate-500 font-medium">Verifying check-in...</p>
        </div>
      </div>
    )
  }

  const badgeId = sessionId.slice(0, 6).toUpperCase()
  const visitorName = visit?.visitor?.name || "Visitor"
  const visitorCompany = visit?.visitor?.company
  const hostName = visit?.host?.name
  const hostCompany = visit?.host?.company
  const purpose = visit?.purpose
  const location = visit?.location ? formatLocation(visit.location) : undefined
  const checkInTime = formatTime(visit?.checkInTimestamp)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        {/* Success Header */}
        <div className="bg-emerald-500 rounded-t-3xl px-8 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-wide">CHECK-IN SUCCESSFUL</span>
        </div>

        {/* Badge Body */}
        <div className="bg-white shadow-2xl rounded-b-3xl overflow-hidden">
          {/* Visitor Name Section */}
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">{visitorName}</h1>
            {visitorCompany && (
              <p className="text-lg text-slate-400 font-medium mt-2">{visitorCompany}</p>
            )}
          </div>

          {/* Divider */}
          <div className="mx-8 border-t border-slate-200" />

          {/* Details Grid */}
          <div className="px-8 py-6 space-y-4">
            {hostName && (
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pt-0.5 shrink-0">Host</span>
                <span className="text-base font-medium text-slate-700">{hostName}</span>
              </div>
            )}
            {hostCompany && (
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pt-0.5 shrink-0">Company</span>
                <span className="text-base font-medium text-slate-700">{hostCompany}</span>
              </div>
            )}
            {purpose && (
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pt-0.5 shrink-0">Purpose</span>
                <span className="text-base font-medium text-slate-700">{purpose}</span>
              </div>
            )}
            {location && (
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pt-0.5 shrink-0">Location</span>
                <span className="text-base font-medium text-slate-700">{location}</span>
              </div>
            )}
            <div className="flex items-start gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pt-0.5 shrink-0">Time</span>
              <span className="text-base font-medium text-slate-700">{checkInTime}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 border-t border-slate-200" />

          {/* Badge ID */}
          <div className="px-8 py-5 text-center">
            <span className="text-sm font-bold text-blue-600 tracking-widest uppercase">
              Visitor Pass #{badgeId}
            </span>
          </div>

          {/* Countdown Footer */}
          <div className="bg-slate-50 px-8 py-4 flex items-center justify-center gap-2 border-t border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-slate-500 font-medium">
              {error
                ? `Returning to home in ${countdown}s...`
                : `Returning to home in ${countdown}s...`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
