import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, LogOut, User } from "lucide-react"
import { toast } from "sonner"
import { fetchActiveVisits, checkoutVisit, getAuthToken } from "@/lib/api"
import type { VisitSession } from "@/lib/api"

type VisitorSearchProps = {
  mode: "checkin" | "checkout"
  onBack?: () => void
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

export function VisitorSearch({ mode, onBack }: VisitorSearchProps) {
  const [query, setQuery] = useState("")
  const [activeVisits, setActiveVisits] = useState<VisitSession[]>([])
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

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

  const filtered =
    mode === "checkout"
      ? activeVisits.filter((v) => matchesQuery(v, query))
      : []

  const handleCheckout = async (sessionId: string) => {
    setCheckingOut(sessionId)
    try {
      await checkoutVisit(sessionId)
      setActiveVisits((prev) => prev.filter((v) => v.sessionId !== sessionId))
      setQuery("")
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
          {mode === "checkin" ? "Find by Phone/Email" : "Find by Phone/Email then Clock out"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "checkin"
            ? "Look up a pre-registered visit (or use Register for new visitors)."
            : "Search active visits and clock out."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Phone or Email</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Phone number or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 touch-manipulation"
            />
          </div>
        </div>

        {mode === "checkin" && (
          <p className="text-sm text-muted-foreground text-center">
            To check in as a new visitor, use the Register option from the Check In menu.
          </p>
        )}

        {mode === "checkout" && (
          <div className="space-y-2">
            {query.trim().length < 2 ? (
              <p className="text-sm text-muted-foreground text-center">Enter at least 2 characters to search.</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No active visit found for this phone/email.</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((v) => (
                  <li
                    key={v.sessionId}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{v.visitor?.name ?? "Visitor"}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {v.visitor?.phone ?? v.visitor?.email ?? v.sessionId}
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
                      <LogOut className="h-4 w-4" /> Check out
                    </Button>
                  </li>
                ))}
              </ul>
            )}
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
