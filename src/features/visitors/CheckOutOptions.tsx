import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Search } from "lucide-react"

type CheckOutOptionsProps = {
  onScan: () => void
  onSearch: () => void
}

export function CheckOutOptions({ onScan, onSearch }: CheckOutOptionsProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Check Out</CardTitle>
        <CardDescription className="text-center">Choose how to check out</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onScan}
          className="w-full h-14 rounded-full text-lg gap-2 bg-blue-700 hover:bg-blue-800 touch-manipulation"
        >
          <QrCode className="h-5 w-5" /> Scan using QR Code
        </Button>
        <Button
          onClick={onSearch}
          variant="secondary"
          className="w-full h-14 rounded-full text-lg gap-2 bg-slate-100 touch-manipulation"
        >
          <Search className="h-5 w-5" /> Find by Phone/email then Check out
        </Button>
      </CardContent>
    </Card>
  )
}
