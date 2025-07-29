"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NeumorphicButton } from "./neumorphic-button"
import { Heading } from "./heading"
import { ExternalLink, Calendar, MapPin, DollarSign, AlertTriangle } from "lucide-react"
import type { Startup } from "@/lib/data"

interface StartupDetailDialogProps {
  startup: Startup | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StartupDetailDialog({ startup, open, onOpenChange }: StartupDetailDialogProps) {
  if (!startup) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0B0B0B] border border-white/10">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="sr-only">Startup Details</DialogTitle>
          <div className="font-doto font-bold text-2xl md:text-3xl text-white mb-2">{startup.name}</div>
          <p className="text-sm md:text-base text-white/70 font-dm-sans">{startup.description}</p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-dm-sans font-semibold text-white mb-3 text-sm uppercase tracking-wide">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-white/60">Founded:</span>
                <span className="text-white ml-2">{startup.founded}</span>
              </div>
              <div>
                <span className="text-white/60">Shut Down:</span>
                <span className="text-white ml-2">{startup.shutDown}</span>
              </div>
              <div>
                <span className="text-white/60">Duration:</span>
                <span className="text-white ml-2">{startup.shutDown - startup.founded} years</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-dm-sans font-semibold text-white mb-3 text-sm uppercase tracking-wide">Location & Industry</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-white/60">Country:</span>
                <span className="text-white ml-2">{startup.country}</span>
              </div>
              <div>
                <span className="text-white/60">Industry:</span>
                <span className="text-white ml-2">{startup.industry}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-dm-sans font-semibold text-white mb-3 text-sm uppercase tracking-wide">Funding</h3>
            <div className="text-2xl font-dm-sans font-bold text-white">{startup.funding}</div>
          </div>

          <div>
            <h3 className="font-dm-sans font-semibold text-white mb-3 text-sm uppercase tracking-wide">Cause of Failure</h3>
            <p className="text-sm text-white/90 leading-relaxed">{startup.causeOfShutdown}</p>
          </div>
        </div>

        {startup.articleUrl && (
          <div className="pt-6 border-t border-white/10 mt-6">
            <a 
              href={startup.articleUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-dm-sans"
            >
              <ExternalLink size={14} />
              Read More About {startup.name}
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
