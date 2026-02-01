import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import { sendHostEmail, sendHostWhatsApp } from "@/lib/notifications"
import { UserPlus, Building2, User, Phone, Mail, Landmark } from "lucide-react"
import { fetchHosts, createVisit, getAuthToken } from "@/lib/api"
import { countries as allCountries } from "@/lib/countries"

const schema = z.object({
  fullName: z.string().min(2),
  company: z.string().min(2),
  phoneCode: z.string().min(1),
  phoneNumber: z.string().regex(/^\d{6,15}$/),
  email: z.string().email().optional().or(z.literal("")),
  purpose: z.enum(["Meeting","Interview","Delivery","Maintenance","Other"]),
  purposeOther: z.string().optional(),
  hostCompany: z.string().min(1),
  hostPerson: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

type Host = {
  id: string
  name: string
  company: string
  email?: string
  phone: string
}

export function WalkInForm() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [qrUrl, setQrUrl] = useState<string>("")
  const companies = useMemo(() => Array.from(new Set(hosts.map(h => h.company))), [hosts])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { purpose: "Meeting", phoneCode: "+974" }
  })

  const selectedCompany = watch("hostCompany")
  const purposeValue = watch("purpose")

  useEffect(() => {
    fetchHosts().then(setHosts).catch(() => setHosts([]))
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      const first = hosts.find(h => h.company === selectedCompany)
      if (first) setValue("hostPerson", first.id)
    }
  }, [selectedCompany, hosts, setValue])

  const companyHosts = useMemo(() => hosts.filter(h => h.company === selectedCompany), [hosts, selectedCompany])

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
    const purposeText = data.purpose === "Other" ? (data.purposeOther || "Other") : data.purpose

    if (config.apiBase && getAuthToken()) {
      try {
        const visit = await createVisit({
          visitorName: data.fullName,
          visitorCompany: data.company,
          visitorPhone: `${data.phoneCode}${data.phoneNumber}`,
          visitorEmail: data.email || undefined,
          hostId: data.hostPerson,
          purpose: purposeText,
          location,
        })
        const payload = { sessionId: visit.sessionId, visitor: { name: visit.visitor.name, company: visit.visitor.company }, purpose: purposeText }
        const b64 = btoa(JSON.stringify(payload))
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(b64)}`
        setQrUrl(url)
        await new Promise(r => setTimeout(r, 800))
        toast.success("Check-in complete", { description: "Host will be notified." })
        reset({ purpose: "Meeting", phoneCode: "+974" })
        return
      } catch (e) {
        toast.error("Check-in failed", { description: (e as Error).message })
        return
      }
    }

    const sessionId = `VMS-${Date.now()}-${Math.floor(Math.random()*1000)}`
    const payload = { sessionId, visitor: { name: data.fullName, company: data.company, phone: `${data.phoneCode}${data.phoneNumber}`, email: data.email }, host: hosts.find(h => h.id === data.hostPerson), purpose: purposeText }
    const enc = new TextEncoder().encode(JSON.stringify(payload))
    const b64 = btoa(String.fromCharCode(...enc))
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(b64)}`
    setQrUrl(url)
    await new Promise(r => setTimeout(r, 800))
    if (payload.host?.email) {
      const subject = "Visitor Check-in Notification"
      const html = `<p>Visitor: ${payload.visitor.name}</p><p>Company: ${payload.visitor.company}</p><p>Purpose: ${payload.purpose}</p><p>Scan QR to verify/check-out.</p>`
      await sendHostEmail(payload.host.email, subject, html)
    }
    if (payload.host?.phone) {
      const text = `Visitor ${payload.visitor.name} checked in for ${payload.purpose}`
      await sendHostWhatsApp(payload.host.phone, text)
    }
    toast.success("Check-in complete", { description: "Host will be notified." })
    reset({ purpose: "Meeting", phoneCode: "+974" })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-center"><UserPlus className="mr-2 h-6 w-6" /> Visitor Check-in</CardTitle>
        <CardDescription className="text-center">Fill details to check in</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input id="fullName" placeholder="Enter your full name" className="pl-10 h-12" {...register("fullName")} />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">Name is required</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input id="company" placeholder="Enter your company name" className="pl-10 h-12" {...register("company")} />
              </div>
              {errors.company && <p className="text-xs text-destructive">Company is required</p>}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="phoneCode">Code</Label>
              <Select
                value={watch("phoneCode")}
                onValueChange={(val) => setValue("phoneCode", val)}
              >
                <SelectTrigger className="h-12 w-full touch-manipulation">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {allCountries.map((c) => (
                    <SelectItem key={c.name} value={c.code}>
                      <span className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`}
                          srcSet={`https://flagcdn.com/w80/${c.iso.toLowerCase()}.png 2x`}
                          alt={c.name}
                          className="w-6 h-4 object-cover rounded-sm"
                        />
                        <span>{c.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input id="phoneNumber" placeholder="55555555" className="pl-10 h-12" {...register("phoneNumber")} />
              </div>
              {errors.phoneNumber && <p className="text-xs text-destructive">Enter 6–15 digits</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input id="email" placeholder="name@company.com" className="pl-10 h-12" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">Invalid email</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <select id="purpose" className="h-12 w-full rounded-md border px-3 bg-background" {...register("purpose")}>
                {(["Meeting","Interview","Delivery","Maintenance","Other"] as const).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {purposeValue === "Other" && (
                <Input placeholder="Enter purpose details" className="mt-2 h-12" {...register("purposeOther")} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hostCompany">Host Company</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                <SearchableSelect
                  options={hostCompanyOptions}
                  value={watch("hostCompany")}
                  onChange={(val) => setValue("hostCompany", val)}
                  placeholder="Select"
                  triggerClassName="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostPerson">Host Person</Label>
              <SearchableSelect
                options={hostPersonOptions}
                value={watch("hostPerson")}
                onChange={(val) => setValue("hostPerson", val)}
                placeholder="Select"
                disabled={companyHosts.length === 0}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>Check In</Button>

          {qrUrl && (
            <div className="flex items-center justify-center pt-2">
              <img src={qrUrl} alt="Visitor check-out QR" loading="lazy" className="rounded-md border" />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
