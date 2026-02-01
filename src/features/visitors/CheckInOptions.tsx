import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Search, UserPlus } from "lucide-react"

type CheckInOptionsProps = {
  onScan: () => void
  onSearch: () => void
  onRegister: () => void
}

export function CheckInOptions({ onScan, onSearch, onRegister }: CheckInOptionsProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Check In</CardTitle>
        <CardDescription className="text-center">Choose how to check in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onScan}
          className="w-full h-14 rounded-full text-lg gap-2 bg-blue-700 hover:bg-blue-800 touch-manipulation"
        >
          <QrCode className="h-5 w-5" /> Scan using QR code
        </Button>
        <Button
          onClick={onSearch}
          variant="secondary"
          className="w-full h-14 rounded-full text-lg gap-2 bg-slate-100 touch-manipulation"
        >
          <Search className="h-5 w-5" /> Find By phone/Email
        </Button>
        <Button
          onClick={onRegister}
          variant="outline"
          className="w-full h-14 rounded-full text-lg gap-2 border-slate-200 touch-manipulation"
        >
          <UserPlus className="h-5 w-5" /> Register
        </Button>
      </CardContent>
    </Card>
  )
}
