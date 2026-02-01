import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"

export function PreRegisterPanel() {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-6 w-6" /> Pre-register Visitors
        </CardTitle>
        <CardDescription>
          Register visitors in advance for your company. Reception can approve before check-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Pre-registration form and list will be implemented here.</p>
      </CardContent>
    </Card>
  )
}
