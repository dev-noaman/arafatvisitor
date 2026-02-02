import { useState, useEffect } from "react";
import { User, Calendar, MapPin } from "lucide-react";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";
import { getVisitPass } from "@/lib/api";

interface VisitorPassProps {
  visitorName: string;
  visitorCompany?: string;
  visitDate: Date;
  location: string;
  hostName: string;
  badgeId: string;
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  qrValue: string;
}

export function VisitorPass() {
  const [data, setData] = useState<VisitorPassProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      setError("No pass ID provided");
      setLoading(false);
      return;
    }

    getVisitPass(id)
      .then((visit) => {
        setData({
          visitorName: visit.visitor.name,
          visitorCompany: visit.visitor.company,
          visitDate: new Date(visit.checkInTimestamp || visit.expectedDate || Date.now()),
          location: visit.location === "BARWA_TOWERS" ? "Barwa Towers" : 
                    visit.location === "MARINA_50" ? "Marina 50" : 
                    visit.location === "ELEMENT_MARIOTT" ? "Element Mariott" : visit.location,
          hostName: visit.host.name,
          badgeId: visit.sessionId.slice(0, 8).toUpperCase(),
          status: visit.status === "CHECKED_IN" || visit.status === "APPROVED" ? "ACTIVE"
                : visit.status === "CHECKED_OUT" || visit.status === "REJECTED" ? "EXPIRED"
                : "PENDING",
          qrValue: visit.sessionId,
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load pass details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
          <div className="text-red-500 font-bold text-xl mb-2">Error</div>
          <p className="text-slate-600">{error || "Pass not found"}</p>
        </div>
      </div>
    );
  }

  const {
    visitorName,
    visitorCompany,
    visitDate,
    location,
    hostName,
    badgeId,
    status,
    qrValue,
  } = data;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col aspect-[9/16] h-auto max-h-[85vh] md:max-h-[800px]">
        {/* Header */}
        <div className="bg-[#1e40af] p-6 flex justify-center items-center shrink-0">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
             <img src="/logo.svg" alt="Company Logo" className="h-8 w-auto brightness-0 invert" />
          </div>
        </div>

        {/* Visitor Info */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center shrink-0">
          <div className="flex items-center gap-2 text-[#1e40af] mb-3">
            <User className="w-5 h-5 fill-current" />
            <span className="font-bold tracking-wide uppercase text-sm">VISITOR</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{visitorName}</h2>
          <p className="text-slate-500 text-sm">{visitorCompany}</p>
        </div>

        {/* QR Code */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-2">
            <QRCode
              value={qrValue}
              size={180}
              className="w-full h-auto max-w-[180px]"
              viewBox={`0 0 256 256`}
            />
          </div>
          <p className="mt-6 text-[#1e40af] font-semibold tracking-wide text-sm uppercase">
            SCAN TO CHECK IN
          </p>
        </div>

        {/* Details */}
        <div className="px-8 py-4 space-y-4 shrink-0">
          <div className="flex items-center gap-4 text-slate-700">
            <Calendar className="w-5 h-5 text-[#1e40af]" />
            <span className="text-sm font-medium">
              {visitDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-700">
            <MapPin className="w-5 h-5 text-[#1e40af]" />
            <span className="text-sm font-medium">{location}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-700">
            <User className="w-5 h-5 text-[#1e40af]" />
            <span className="text-sm font-medium">{hostName}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 mt-auto shrink-0 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-white font-semibold text-[10px] tracking-wider",
                  status === "ACTIVE" ? "bg-green-600" : status === "EXPIRED" ? "bg-red-500" : "bg-amber-500"
                )}
              >
                {status}
              </span>
              <span className="font-medium">
                {status === "ACTIVE" ? "Valid Today" : status === "EXPIRED" ? "No Longer Valid" : "Pending Approval"}
              </span>
            </div>
            <span>Badge ID: {badgeId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
