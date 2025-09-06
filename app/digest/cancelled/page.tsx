export default function DigestCancelledPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full neumorphic-card p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-dm-sans mb-2">Subscription Cancelled</h1>
        <p className="text-white/70 mb-6">
          No worries! Your subscription was cancelled and you haven't been
          charged.
        </p>

        <div className="space-y-3">
          <a
            href="/"
            className="block bg-white text-black px-6 py-2 rounded-lg font-dm-sans font-medium hover:bg-white/90 transition-colors"
          >
            Back to Homepage
          </a>

          <p className="text-sm text-white/50">
            Changed your mind? You can subscribe anytime for free.
          </p>
        </div>
      </div>
    </div>
  );
}
