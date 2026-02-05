import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Truck, Package } from "lucide-react"
import { fetchHosts, createDelivery, getAuthToken, fetchDeliveryTypeLookups } from "@/lib/api"
import type { Host, LookupItem } from "@/lib/api"

const schema = z.object({
  typeOfDelivery: z.string().min(1, "Type of delivery is required"),
  hostCompany: z.string().min(1, "Host company is required"),
})

type FormValues = z.infer<typeof schema>

export function DeliveryForm() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [deliveryTypes, setDeliveryTypes] = useState<LookupItem[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(false)
  const configRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vms_config") : null
  const config = configRaw ? JSON.parse(configRaw) : {}
  const useApi = !!(config.apiBase && getAuthToken())

  useEffect(() => {
    fetchHosts().then(setHosts).catch(() => setHosts([]))

    // Fetch delivery types from API
    setIsLoadingTypes(true)
    fetchDeliveryTypeLookups()
      .then(setDeliveryTypes)
      .catch(() => setDeliveryTypes([]))
      .finally(() => setIsLoadingTypes(false))
  }, [])

  const companies = Array.from(new Set(hosts.map((h) => h.company))).filter(Boolean).sort()
  const companyOptions = companies.map(c => ({ value: c, label: c }))

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { typeOfDelivery: "", hostCompany: "" },
  })

  const hostCompany = watch("hostCompany")

  const onSubmit = async (data: FormValues) => {
    const host = hosts.find((h) => h.company === data.hostCompany)
    if (useApi && host?.id) {
      try {
        await createDelivery({
          recipient: data.typeOfDelivery,
          courier: "Kiosk",
          hostId: host.id,
          notes: `Type: ${data.typeOfDelivery}`,
        })
        toast.success("Host notified", { description: "Delivery logged and host will be notified." })
        setValue("typeOfDelivery", "")
        setValue("hostCompany", "")
      } catch (e) {
        toast.error("Failed", { description: (e as Error).message })
      }
      return
    }
    toast.success("Delivery logged", { description: "Host will be notified." })
    setValue("typeOfDelivery", "")
    setValue("hostCompany", "")
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Truck className="h-6 w-6" />
          Deliveries
        </CardTitle>
        <CardDescription className="text-center">
          Log a delivery and notify the host company
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="typeOfDelivery">Type of Delivery</Label>
            <Select
              value={watch("typeOfDelivery")}
              onValueChange={(value) => setValue("typeOfDelivery", value)}
              disabled={isLoadingTypes}
            >
              <SelectTrigger className="h-12 touch-manipulation">
                <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select type of delivery"} />
              </SelectTrigger>
              <SelectContent>
                {deliveryTypes.map((type) => (
                  <SelectItem key={type.id} value={type.label}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeOfDelivery && (
              <p className="text-sm text-destructive">{errors.typeOfDelivery.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Host Company</Label>
            <SearchableSelect
              options={companyOptions}
              value={hostCompany}
              onChange={(v) => setValue("hostCompany", v)}
              placeholder="Select host company..."
              triggerClassName="h-12"
            />
            {errors.hostCompany && (
              <p className="text-sm text-destructive">{errors.hostCompany.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-full text-lg touch-manipulation"
            disabled={isSubmitting}
          >
            Notify Host
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
