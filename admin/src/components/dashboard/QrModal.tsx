import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import * as dashboardService from '@/services/dashboard'
import { CurrentVisitor } from '@/services/dashboard'

interface QrModalProps {
  visitor: CurrentVisitor | null
  isOpen: boolean
  onClose: () => void
}

export function QrModal({ visitor, isOpen, onClose }: QrModalProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false)

  useEffect(() => {
    if (isOpen && visitor) {
      // Use existing QR data URL if available, otherwise fetch it
      if (visitor.qrDataUrl) {
        setQrDataUrl(visitor.qrDataUrl)
      } else {
        fetchQrCode()
      }
    } else {
      setQrDataUrl(null)
    }
  }, [isOpen, visitor])

  const fetchQrCode = async () => {
    if (!visitor) return
    setIsLoadingQr(true)
    try {
      const response = await dashboardService.getQrCode(visitor.id)
      setQrDataUrl(response.qrDataUrl)
    } catch (error) {
      showError('Failed to load QR code')
    } finally {
      setIsLoadingQr(false)
    }
  }

  const handleSendEmail = async () => {
    if (!visitor) return
    setIsSendingEmail(true)
    try {
      await dashboardService.sendQr(visitor.id, 'email')
      showSuccess('QR code sent via email successfully!')
    } catch (error) {
      showError('Failed to send QR code via email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSendWhatsapp = async () => {
    if (!visitor) return
    setIsSendingWhatsapp(true)
    try {
      await dashboardService.sendQr(visitor.id, 'whatsapp')
      showSuccess('QR code sent via WhatsApp successfully!')
    } catch (error) {
      showError('Failed to send QR code via WhatsApp')
    } finally {
      setIsSendingWhatsapp(false)
    }
  }

  if (!isOpen || !visitor) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Visitor QR Code</h3>
                <p className="text-blue-100 text-sm">Scan or share this QR code</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Visitor Info */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">{visitor.visitorName}</h4>
              {visitor.visitorCompany && (
                <p className="text-sm text-gray-500">{visitor.visitorCompany}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Visiting <span className="font-medium">{visitor.hostName}</span>
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="relative bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner">
                {isLoadingQr ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-sm text-gray-500">QR code not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{visitor.visitorPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 truncate">{visitor.visitorEmail || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Send Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 text-center mb-3">Send QR Code via</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSendWhatsapp}
                  disabled={isSendingWhatsapp || !visitor.visitorPhone}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-600/30 hover:shadow-green-600/40"
                >
                  {isSendingWhatsapp ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  )}
                  <span className="font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !visitor.visitorEmail}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40"
                >
                  {isSendingEmail ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="font-medium">Email</span>
                </button>
              </div>
              {(!visitor.visitorPhone && !visitor.visitorEmail) && (
                <p className="text-xs text-center text-amber-600 mt-2">
                  No contact information available for this visitor
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrModal
