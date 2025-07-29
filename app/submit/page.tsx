import { Heading } from "@/components/heading"
import { SubmitForm } from "@/components/submit-form"
import { NeumorphicButton } from "@/components/neumorphic-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <div className="mb-6 md:mb-8">
          <Link href="/">
            <NeumorphicButton className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Graveyard</span>
              <span className="sm:hidden">Back</span>
            </NeumorphicButton>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Heading level={1} className="mb-4 text-white">
            Add to the Graveyard
          </Heading>
          <p className="text-base md:text-lg text-white/70 font-dm-sans max-w-2xl mx-auto px-4">
            Help preserve the history of entrepreneurship by documenting failed startups. Every failure teaches us
            something valuable.
          </p>
        </div>

        {/* Form */}
        <SubmitForm />
      </div>
    </div>
  )
}
