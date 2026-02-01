import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Lock, User, ArrowLeft, Mail, ShieldCheck, Crown, Users } from "lucide-react"
import { login as apiLogin, forgotPassword as apiForgotPassword, setAuthToken } from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const QUICK_ADMIN = { email: "admin@arafatvisitor.cloud", password: "admin123" }
const QUICK_GM = { email: "gm@arafatvisitor.cloud", password: "gm123" }
const QUICK_RECEPTION = { email: "reception@arafatvisitor.cloud", password: "reception123" }

const showDebugLogin = import.meta.env.VITE_SHOW_DEBUG_LOGIN === "true"

const forgotSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

type LoginFormValues = z.infer<typeof loginSchema>
type ForgotFormValues = z.infer<typeof forgotSchema>

export function LoginForm(props: { onLoginSuccess?: (role: "admin" | "reception") => void }) {
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgot
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
      const configRaw = sessionStorage.getItem("vms_config")
      let config: any = {}
      try {
        config = configRaw ? JSON.parse(configRaw) : {}
      } catch (e) {
        console.warn("Invalid VMS config", e)
      }

      if (config.apiBase) {
      try {
        const { token: newToken, user } = await apiLogin(data.email, data.password)
        setAuthToken(newToken)
        if (user.role === "HOST") {
          toast.error("Host accounts use Admin only", { description: "Log in at http://localhost:3000/admin/login for limited access." })
          return
        }
        const role = user.role.toLowerCase() as "admin" | "reception"
        toast.success("Login successful", { description: "Welcome back to the VMS Dashboard." })
        props.onLoginSuccess?.(role)
        return
      } catch (e) {
        console.warn("API Login failed, falling back to simulation:", e)
        // Fallthrough to simulated logic
      }
    }
    // Simulated when no API
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success("Login successful", { description: "Welcome back to the VMS Dashboard." })
    props.onLoginSuccess?.("admin")
  }

  const onForgotSubmit = async (data: ForgotFormValues) => {
    setIsResetting(true)
    const configRaw = sessionStorage.getItem("vms_config")
    const config = configRaw ? JSON.parse(configRaw) : {}
    if (config.apiBase) {
      try {
        await apiForgotPassword(data.email)
        toast.success("Reset link sent", {
          description: "If an account exists, you will receive a password reset link shortly.",
        })
      } catch (e) {
        toast.error("Request failed", { description: (e as Error).message })
      }
      setIsResetting(false)
      setIsForgotPassword(false)
      resetForgot()
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success("Reset link sent", {
      description: `If an account exists for ${data.email}, you will receive a password reset link shortly.`,
    })
    setIsResetting(false)
    setIsForgotPassword(false)
    resetForgot()
  }

  if (isForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary animate-in fade-in slide-in-from-right-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  placeholder="name@company.com"
                  type="email"
                  className="pl-10 h-12"
                  {...registerForgot("email")}
                />
              </div>
              {errorsForgot.email && (
                <p className="text-sm text-destructive">{errorsForgot.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={isResetting}>
              {isResetting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-2"
            onClick={() => setIsForgotPassword(false)}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary animate-in fade-in slide-in-from-left-4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Employee Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                placeholder="name@company.com"
                type="email"
                className="pl-10 h-12"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-10 h-12"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
          {showDebugLogin && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 touch-manipulation text-xs"
                disabled={isSubmitting}
                onClick={() => onSubmit(QUICK_ADMIN)}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 touch-manipulation text-xs"
                disabled={isSubmitting}
                onClick={() => onSubmit(QUICK_GM)}
              >
                <Crown className="h-3.5 w-3.5" /> GM
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 touch-manipulation text-xs"
                disabled={isSubmitting}
                onClick={() => onSubmit(QUICK_RECEPTION)}
              >
                <Users className="h-3.5 w-3.5" /> Reception
              </Button>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setIsForgotPassword(true)}
        >
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  )
}
