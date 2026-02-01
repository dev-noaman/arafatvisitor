import { useState, useEffect } from "react"
import { LoginForm } from "@/features/auth/LoginForm"
import { QRScanner } from "@/features/visitors/QRScanner"
import { CheckInOptions } from "@/features/visitors/CheckInOptions"
import { CheckOutOptions } from "@/features/visitors/CheckOutOptions"
import { VisitorSearch } from "@/features/visitors/VisitorSearch"
import { CheckInRegister } from "@/features/visitors/CheckInRegister"
import { WalkInForm } from "@/features/visitors/WalkInForm"
import { DeliveryForm } from "@/features/deliveries/DeliveryForm"
import { ReportsPanel } from "@/features/reports/ReportsPanel"
import { Toaster } from "sonner"
import { ShieldCheck, Truck, LogOut, ArrowLeft, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setAuthToken } from "@/lib/api"
import QRCode from "react-qr-code"

type Role = "admin" | "reception"
type View =
  | "dashboard"
  | "checkin-options"
  | "checkout-options"
  | "delivery-form"
  | "scan-checkin"
  | "scan-checkout"
  | "search-checkin"
  | "search-checkout"
  | "register"
  | "walkin"
  | "reports"

function App() {
  const isRegisterPage = window.location.pathname === "/register"
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [currentView, setCurrentView] = useState<View>("dashboard")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = (r?: Role) => {
    setIsLoggedIn(true)
    setRole(r ?? "admin")
    setCurrentView("dashboard")
  }

  const handleLogout = () => {
    setAuthToken(null)
    setIsLoggedIn(false)
    setRole(null)
    setCurrentView("dashboard")
  }

  const navigateTo = (view: Exclude<View, "dashboard">) => {
    setCurrentView(view)
  }

  const navigateHome = () => {
    setCurrentView("dashboard")
  }

  const showBackButton = currentView !== "dashboard"

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight">Arafat Visitor</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xl font-medium tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              {(role === "admin" || role === "reception") && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  title="Open Admin dashboard"
                  onClick={() => {
                    const token = window.sessionStorage.getItem("vms_token")
                    if (token) {
                      window.open(
                        `http://localhost:3000/admin/auto-login?token=${encodeURIComponent(token)}`,
                        "_blank",
                      )
                    } else {
                      window.open("http://localhost:3000/admin", "_blank")
                    }
                  }}
                >
                  <User className="h-4 w-4" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center w-full">
        {!isLoggedIn && !isRegisterPage ? (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LoginForm onLoginSuccess={handleLogin} />
          </div>
        ) : (
          <div className="w-full max-w-7xl">
            {isRegisterPage ? (
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
                <CheckInRegister />
              </div>
            ) : currentView === "dashboard" ? (
              <div className="bg-white rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-start justify-center gap-8">
                  <div className="text-slate-900">
                    <img src="/logo.svg" className="h-40 w-auto" alt="Logo" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      Arafat Visitor Access
                    </h2>
                    <div className="space-y-2 text-lg text-slate-500 font-medium">
                      <p>We’re glad you’re here.</p>
                      <p>Please choose how you’d like to proceed.</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-5 w-full max-w-md ml-auto">
                  <Button
                    onClick={() => navigateTo("checkin-options")}
                    className="w-full h-20 rounded-full text-xl font-semibold justify-between px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                  >
                    <span className="flex items-center gap-3">
                      Check In
                    </span>
                    <ArrowRight className="h-6 w-6" />
                  </Button>

                  <Button
                    onClick={() => navigateTo("delivery-form")}
                    variant="outline"
                    className="w-full h-20 rounded-full text-xl font-semibold justify-start px-8 gap-4 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                  >
                    <Truck className="h-6 w-6 text-slate-600" />
                    Deliveries
                  </Button>

                  <Button
                    onClick={() => navigateTo("checkout-options")}
                    variant="outline"
                    className="w-full h-20 rounded-full text-xl font-semibold justify-start px-8 gap-4 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                  >
                    <LogOut className="h-6 w-6 text-slate-600" />
                    Check Out
                  </Button>

                  <div className="mt-4 bg-slate-100/50 rounded-2xl p-6 flex items-center justify-between gap-4 border border-slate-200/60">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-[12rem]">
                      Scan this QR code with your phone and do the continue there.
                    </p>
                    <div className="bg-white p-2 rounded-xl shadow-sm shrink-0">
                      <QRCode
                        value={`${window.location.origin}/register`}
                        size={80}
                        className="h-20 w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
                {showBackButton && (
                  <div className="w-full flex justify-start mb-6">
                    <Button variant="outline" onClick={navigateHome} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Button>
                  </div>
                )}
                {currentView === "checkin-options" && (
                  <CheckInOptions
                    onScan={() => navigateTo("scan-checkin")}
                    onSearch={() => navigateTo("search-checkin")}
                    onRegister={() => navigateTo("register")}
                  />
                )}
                {currentView === "checkout-options" && (
                  <CheckOutOptions
                    onScan={() => navigateTo("scan-checkout")}
                    onSearch={() => navigateTo("search-checkout")}
                  />
                )}
                {currentView === "delivery-form" && <DeliveryForm />}
                {currentView === "scan-checkin" && (
                  <QRScanner
                    mode="checkin"
                    onBack={() => navigateTo("checkin-options")}
                  />
                )}
                {currentView === "scan-checkout" && (
                  <QRScanner
                    mode="checkout"
                    onBack={() => navigateTo("checkout-options")}
                  />
                )}
                {currentView === "search-checkin" && (
                  <VisitorSearch
                    mode="checkin"
                    onBack={() => navigateTo("checkin-options")}
                  />
                )}
                {currentView === "search-checkout" && (
                  <VisitorSearch
                    mode="checkout"
                    onBack={() => navigateTo("checkout-options")}
                  />
                )}
                {currentView === "register" && <CheckInRegister />}
                {currentView === "walkin" && <WalkInForm />}
                {currentView === "reports" && <ReportsPanel />}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-white">
        <p>
          © 2026 Arafat Group. System Status:{" "}
          <span className="text-green-600 font-medium">Online</span>
        </p>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
