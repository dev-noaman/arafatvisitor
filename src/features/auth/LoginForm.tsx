import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Lock, User, ArrowLeft, Mail } from "lucide-react"
import { login as apiLogin, forgotPassword as apiForgotPassword, setAuthToken, getAdminUrl, getApiBase } from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

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
      const apiBase = getApiBase()
      if (apiBase) {
        try {
          const { token: newToken, user } = await apiLogin(data.email, data.password)
          setAuthToken(newToken)
          if (user.role === "HOST") {
            toast.error("Host accounts use Admin only", { description: `Log in at ${getAdminUrl()}/login for limited access.` })
            return
          }
          const role = (user.role === "ADMIN" || user.role === "RECEPTION" ? user.role.toLowerCase() : "admin") as "admin" | "reception"
          toast.success("Login successful", { description: "Welcome back to the VMS Dashboard." })
          props.onLoginSuccess?.(role)
          return
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Login failed. Please try again."
          toast.error("Login failed", { description: msg })
          return
        }
      }
      // Simulated when no API configured (demo mode)
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Login successful", { description: "Demo mode — no API configured." })
      props.onLoginSuccess?.("admin")
  }

  const onForgotSubmit = async (data: ForgotFormValues) => {
    setIsResetting(true)
    if (getApiBase()) {
      try {
        await apiForgotPassword(data.email)
        toast.success("Reset link sent", {
          description: "If an account exists, you will receive a password reset link shortly.",
        })
      } catch (e) {
        toast.error("Request failed", { description: (e as Error).message })
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Reset link sent", {
        description: `If an account exists for ${data.email}, you will receive a password reset link shortly.`,
      })
    }
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
                  placeholder="Enter your Email"
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
                placeholder="Enter your Email"
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
                placeholder="Enter your Password"
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
