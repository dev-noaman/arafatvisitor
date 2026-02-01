import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { sendHostEmail, sendHostWhatsApp } from "@/lib/notifications"
import { UserPlus, Building2, User, Phone, Mail, Landmark } from "lucide-react"
import { fetchHosts, createVisit, getAuthToken } from "@/lib/api"
import { countries as allCountries } from "@/lib/countries"

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  company: z.string().optional(),
  phoneCode: z.string().min(1),
  phoneNumber: z.string().regex(/^\d{6,15}$/, "Enter 6–15 digits"),
  email: z.string().email().optional().or(z.literal("")),
  purpose: z.enum(["Meeting", "Interview", "Delivery", "Maintenance", "Other"]),
  purposeOther: z.string().optional(),
  hostCompany: z.string().min(1, "Host company/person is required"),
  hostPerson: z.string().min(1, "Host company/person is required"),
})

type FormValues = z.infer<typeof schema>

type Host = {
  id: string
  name: string
  company: string
  email?: string
  phone: string
}

const PURPOSE_OPTIONS = ["Meeting", "Interview", "Delivery", "Maintenance", "Other"] as const

export function CheckInRegister() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [qrUrl, setQrUrl] = useState<string>("")
  const companies = useMemo(() => Array.from(new Set(hosts.map((h) => h.company))), [hosts])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { purpose: "Meeting", phoneCode: "+974" },
  })

  const selectedCompany = watch("hostCompany")
  const purposeValue = watch("purpose")
  const fullName = watch("fullName")
  const phoneNumber = watch("phoneNumber")
  const hostPersonValue = watch("hostPerson")

  const requiredFilled =
    (fullName?.trim().length ?? 0) >= 2 &&
    (phoneNumber?.length ?? 0) >= 6 &&
    (hostPersonValue?.length ?? 0) >= 1

  useEffect(() => {
    fetchHosts().then(setHosts).catch(() => setHosts([]))
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      const first = hosts.find((h) => h.company === selectedCompany)
      if (first) setValue("hostPerson", first.id)
    }
  }, [selectedCompany, hosts, setValue])

  const companyHosts = useMemo(
    () => hosts.filter((h) => h.company === selectedCompany),
    [hosts, selectedCompany]
  )

  const countryOptions = useMemo(() => allCountries.map(c => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
    selectedLabel: c.code,
    icon: <img src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w80/${c.iso.toLowerCase()}.png 2x`} alt={c.name} className="w-6 h-4 object-cover rounded-sm" />
  })), [])

  const hostCompanyOptions = useMemo(() => companies.map(c => ({
    value: c,
    label: c
  })), [companies])

  const hostPersonOptions = useMemo(() => companyHosts.map(h => ({
    value: h.id,
    label: h.name
  })), [companyHosts])

  const onSubmit = async (data: FormValues) => {
    const configRaw = sessionStorage.getItem("vms_config")
    const config = configRaw ? JSON.parse(configRaw) : {}
    const location = config.location || "Barwa Towers"
    const purposeText =
      data.purpose === "Other" ? (data.purposeOther || "Other") : data.purpose

    if (config.apiBase && getAuthToken()) {
      try {
        const visit = await createVisit({
          visitorName: data.fullName,
          visitorCompany: data.company || "",
          visitorPhone: `${data.phoneCode}${data.phoneNumber}`,
          visitorEmail: data.email || undefined,
          hostId: data.hostPerson,
          purpose: purposeText,
          location,
        })
        const payload = {
          sessionId: visit.sessionId,
          visitor: { name: visit.visitor.name, company: visit.visitor.company },
          purpose: purposeText,
        }
        const b64 = btoa(JSON.stringify(payload))
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(b64)}`
        setQrUrl(url)
        await new Promise((r) => setTimeout(r, 800))
        toast.success("Check-in complete", { description: "Host will be notified." })
        reset({ purpose: "Meeting", phoneCode: "+974" })
        return
      } catch (e) {
        toast.error("Check-in failed", { description: (e as Error).message })
        return
      }
    }

    const sessionId = `VMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const payload = {
      sessionId,
      visitor: {
        name: data.fullName,
        company: data.company ?? "",
        phone: `${data.phoneCode}${data.phoneNumber}`,
        email: data.email,
      },
      host: hosts.find((h) => h.id === data.hostPerson),
      purpose: purposeText,
    }
    const enc = new TextEncoder().encode(JSON.stringify(payload))
    const b64 = btoa(String.fromCharCode(...enc))
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(b64)}`
    setQrUrl(url)
    await new Promise((r) => setTimeout(r, 800))
    if (payload.host?.email) {
      await sendHostEmail(
        payload.host.email,
        "Visitor Check-in Notification",
        `<p>Visitor: ${payload.visitor.name}</p><p>Company: ${payload.visitor.company}</p><p>Purpose: ${payload.purpose}</p><p>Scan QR to verify/check-out.</p>`
      )
    }
    if (payload.host?.phone) {
      await sendHostWhatsApp(
        payload.host.phone,
        `Visitor ${payload.visitor.name} checked in for ${payload.purpose}`
      )
    }
    toast.success("Check-in complete", { description: "Host will be notified." })
    reset({ purpose: "Meeting", phoneCode: "+974" })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-center">
          <UserPlus className="mr-2 h-6 w-6" /> Visitor Registration
        </CardTitle>
        <CardDescription className="text-center">
          Fill details to check in. Host will be notified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  className="pl-10 h-12 touch-manipulation"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="Enter your company name (optional)"
                  className="pl-10 h-12 touch-manipulation"
                  {...register("company")}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="phoneCode">Code</Label>
              <SearchableSelect
                options={countryOptions}
                value={watch("phoneCode")}
                onChange={(val) => setValue("phoneCode", val)}
                placeholder="Code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  placeholder="55555555"
                  className="pl-10 h-12 touch-manipulation"
                  {...register("phoneNumber")}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="name@company.com (optional)"
                  className="pl-10 h-12 touch-manipulation"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Purpose of Visit *</Label>
              <Select
                value={purposeValue}
                onValueChange={(v) => setValue("purpose", v as FormValues["purpose"])}
              >
                <SelectTrigger className="h-12 touch-manipulation">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {purposeValue === "Other" && (
                <Input
                  placeholder="Enter purpose details"
                  className="mt-2 h-12 touch-manipulation"
                  {...register("purposeOther")}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Host Company / Host Person *</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                <SearchableSelect
                  options={hostCompanyOptions}
                  value={watch("hostCompany")}
                  onChange={(val) => setValue("hostCompany", val)}
                  placeholder="Select company"
                  triggerClassName="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostPerson">Host Person *</Label>
              <SearchableSelect
                options={hostPersonOptions}
                value={watch("hostPerson")}
                onChange={(val) => setValue("hostPerson", val)}
                placeholder="Select person"
                disabled={companyHosts.length === 0}
              />
              {errors.hostPerson && (
                <p className="text-xs text-destructive">{errors.hostPerson.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-full text-lg touch-manipulation"
            disabled={isSubmitting || !requiredFilled}
          >
            Register & Notify Host
          </Button>

          {qrUrl && (
            <div className="flex items-center justify-center pt-2">
              <img
                src={qrUrl}
                alt="Visitor check-out QR"
                loading="lazy"
                className="rounded-md border"
              />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
