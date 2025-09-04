import { Heading } from "@/components/heading";
import { StartupTable } from "@/components/startup-table";
import { Suspense } from "react";
import { DigestSubscribeDialog } from "@/components/digest-subscribe-dialog";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Heading className="text-white mb-4 font-doto font-medium tracking-tighter">
            Closed Companies
          </Heading>
          <p className="text-lg md:text-xl text-white/70 font-dm-sans max-w-2xl mx-auto px-4">
            A public archive documenting the rise and fall of ambitious startups
            that didn't make it
          </p>
          <div className="mt-4 flex justify-center">
            <DigestSubscribeDialog />
          </div>
          {/* Peerlist Badge */}
          {/* <div className="flex justify-center mt-6 mb-2">
            <a
              href="https://peerlist.io/akshatbuilds/project/closed-companies"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://peerlist.io/api/v1/projects/embed/PRJHDNDKPGN9ERL9L2A97NONQRAQJK?showUpvote=true&theme=dark"
                alt="Closed Companies"
                style={{ width: "auto", height: "72px" }}
              />
            </a>
          </div> */}
        </div>

        {/* Table with integrated stats and filters */}
        <div className="mb-8">
          <StartupTable />
        </div>

        {/* Footer */}
        <div className="text-center text-white/70 font-dm-sans text-sm">
          <p>Learning from failure, one startup at a time.</p>
        </div>
      </div>
    </div>
  );
}
