import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, Search, Truck, Clock } from "lucide-react"
import { toast } from "sonner"
import { fetchDeliveries, createDelivery, receiveDelivery, getAuthToken } from "@/lib/api"

interface Delivery {
  id: string
  recipient: string
  status: "Pending" | "Received"
  time: string
  courier: string
}

const initialDeliveries: Delivery[] = []

function normalizeDelivery(d: any): Delivery {
  return {
    id: String(d.id),
    recipient: d.recipient ?? "",
    status: d.status === "RECEIVED" ? "Received" : "Pending",
    time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    courier: d.courier ?? "",
  }
}

export function DeliveriesPanel() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)
  const [search, setSearch] = useState("")
  const configRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vms_config") : null
  const config = configRaw ? JSON.parse(configRaw) : {}
  const useApi = !!(config.apiBase && getAuthToken())

  useEffect(() => {
    if (!useApi) return
    fetchDeliveries(search)
      .then((list) => setDeliveries((list ?? []).map(normalizeDelivery)))
      .catch(() => setDeliveries([]))
  }, [useApi, search])

  const filteredDeliveries = useApi
    ? deliveries
    : deliveries.filter(
        (d) =>
          d.recipient.toLowerCase().includes(search.toLowerCase()) ||
          d.id.toLowerCase().includes(search.toLowerCase())
      )

  const handleReceive = async (id: string) => {
    if (useApi) {
      try {
        await receiveDelivery(id)
        setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Received" as const } : d)))
        toast.success(`Delivery ${id} marked as Received`)
      } catch (e) {
        toast.error("Failed to mark received", { description: (e as Error).message })
      }
      return
    }
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Received" } : d)))
    toast.success(`Delivery ${id} marked as Received`)
  }

  const handleLogDelivery = async () => {
    if (useApi) {
      try {
        const created = await createDelivery({ recipient: "New Recipient", courier: "Unknown" })
        setDeliveries((prev) => [normalizeDelivery(created), ...prev])
        toast.success("New delivery logged successfully")
      } catch (e) {
        toast.error("Failed to log delivery", { description: (e as Error).message })
      }
      return
    }
    const newId = `DEL-${Math.floor(Math.random() * 1000)}`
    const newDelivery: Delivery = {
      id: newId,
      recipient: "New Recipient",
      status: "Pending",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      courier: "Unknown",
    }
    setDeliveries([newDelivery, ...deliveries])
    toast.success("New delivery logged successfully")
  }

  return (
    <Card className="w-full shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
             <CardTitle className="text-xl font-bold flex items-center">
                <Truck className="mr-2 h-5 w-5" /> Deliveries
             </CardTitle>
             <CardDescription>Manage incoming packages</CardDescription>
          </div>
          <Button size="sm" onClick={handleLogDelivery}>
            <Package className="mr-2 h-4 w-4" /> Log New
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or Recipient..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No deliveries found.</p>
          ) : (
            filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors touch-manipulation">
                <div className="space-y-1">
                  <p className="font-medium leading-none text-base">{delivery.recipient}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <span className="font-mono mr-2">{delivery.id}</span>
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {delivery.time}</span>
                    <span className="mx-2">•</span>
                    <span>{delivery.courier}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    delivery.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}>
                    {delivery.status}
                  </div>
                  {delivery.status === "Pending" && (
                    <Button size="sm" variant="ghost" className="h-10 px-4" onClick={() => handleReceive(delivery.id)}>
                      Mark Received
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
