import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export function ReportsPanel(props: { companyScoped?: boolean }) {
  const scopeLabel = props.companyScoped ? "Company-scoped" : "Full"
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" /> Reports
        </CardTitle>
        <CardDescription>
          {props.companyScoped
            ? "Visitor and visit reports for your company only."
            : "Visitor and visit reports across the system."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Scope: <span className="font-medium text-foreground">{scopeLabel}</span>. Report content will be implemented here.
        </p>
      </CardContent>
    </Card>
  )
}
