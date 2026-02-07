import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, LogOut, LogIn, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { fetchActiveVisits, checkoutVisit, checkinVisit, searchVisitsByContact, getAuthToken } from "@/lib/api"
import type { VisitSession } from "@/lib/api"

type VisitorSearchProps = {
  mode: "checkin" | "checkout"
  onBack?: () => void
  onCheckin?: (sessionId: string) => void
}

function normalizePhone(s: string): string {
  return s.replace(/\D/g, "").slice(-8)
}

function matchesQuery(visit: VisitSession, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false
  const phone = (visit.visitor?.phone ?? "").replace(/\D/g, "")
  const email = (visit.visitor?.email ?? "").toLowerCase()
  const name = (visit.visitor?.name ?? "").toLowerCase()
  if (normalizePhone(q).length >= 4 && phone.includes(normalizePhone(q))) return true
  if (email && q.length >= 3 && email.includes(q)) return true
  if (name && q.length >= 2 && name.includes(q)) return true
  return false
}

export function VisitorSearch({ mode, onBack, onCheckin }: VisitorSearchProps) {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [checkinResults, setCheckinResults] = useState<any[]>([])
  const [activeVisits, setActiveVisits] = useState<VisitSession[]>([])
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)

  const configRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vms_config") : null
  const config = configRaw ? JSON.parse(configRaw) : {}
  const useApi = !!(config.apiBase && getAuthToken())

  useEffect(() => {
    if (mode === "checkout" && useApi) {
      fetchActiveVisits()
        .then(setActiveVisits)
        .catch(() => setActiveVisits([]))
    }
  }, [mode, useApi])

  const handleSearch = async () => {
    const q = query.trim()
    if (q.length < 2) {
      toast.error("Please enter at least 2 characters")
      return
    }

    setSearching(true)
    setSearched(true)

    if (mode === "checkin") {
      try {
        const results = await searchVisitsByContact(q)
        setCheckinResults(results)
        if (results.length === 0) {
          toast.info("No pre-registered visit found for this phone/email")
        }
      } catch (e) {
        toast.error("Search failed", { description: (e as Error).message })
        setCheckinResults([])
      }
    } else {
      // Checkout: refresh active visits then filter client-side
      try {
        const visits = await fetchActiveVisits()
        setActiveVisits(visits)
      } catch {
        // keep existing list
      }
    }

    setSearching(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  const filteredCheckout =
    mode === "checkout" && searched
      ? activeVisits.filter((v) => matchesQuery(v, query))
      : []

  const handleCheckin = async (sessionId: string) => {
    setCheckingIn(sessionId)
    try {
      await checkinVisit(sessionId)
      toast.success("Visitor checked in successfully")
      if (onCheckin) {
        onCheckin(sessionId)
      }
    } catch (e) {
      toast.error("Check-in failed", { description: (e as Error).message })
    } finally {
      setCheckingIn(null)
    }
  }

  const handleCheckout = async (sessionId: string) => {
    setCheckingOut(sessionId)
    try {
      await checkoutVisit(sessionId)
      setActiveVisits((prev) => prev.filter((v) => v.sessionId !== sessionId))
      setQuery("")
      setSearched(false)
      toast.success("Visitor checked out successfully")
    } catch (e) {
      toast.error("Check-out failed", { description: (e as Error).message })
    } finally {
      setCheckingOut(null)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Search className="h-6 w-6" />
          {mode === "checkin" ? "Find by Phone/Email" : "Find by Phone/Email"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "checkin"
            ? "Search for your pre-registered visit to check in."
            : "Search active visits to check out."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Phone or Email</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Phone number or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-12 touch-manipulation"
                autoFocus
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || query.trim().length < 2}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
            >
              {searching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Check-in mode results */}
        {mode === "checkin" && searched && !searching && (
          <div className="space-y-2">
            {checkinResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pre-registered visit found for this phone/email.
              </p>
            ) : (
              <ul className="space-y-2">
                {checkinResults.map((v) => (
                  <li
                    key={v.sessionId}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{v.visitorName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {v.visitorCompany}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Host: {v.host?.name} &middot; {v.purpose}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1 bg-green-600 hover:bg-green-700 text-white touch-manipulation"
                      disabled={checkingIn === v.sessionId}
                      onClick={() => handleCheckin(v.sessionId)}
                    >
                      {checkingIn === v.sessionId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4" />
                      )}
                      Check In
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Check-out mode results */}
        {mode === "checkout" && searched && !searching && (
          <div className="space-y-2">
            {filteredCheckout.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active visit found for this phone/email.
              </p>
            ) : (
              <ul className="space-y-2">
                {filteredCheckout.map((v) => (
                  <li
                    key={v.sessionId}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{v.visitor?.name ?? "Visitor"}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {v.visitor?.company}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1 border-slate-200 touch-manipulation"
                      disabled={checkingOut === v.sessionId}
                      onClick={() => handleCheckout(v.sessionId)}
                    >
                      {checkingOut === v.sessionId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Check Out
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Loading spinner */}
        {searching && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {onBack && (
          <Button className="w-full touch-manipulation bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
