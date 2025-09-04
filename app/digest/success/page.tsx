export default async function DigestSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;
  const email = params?.email;

  // Debug: log all search params
  console.log("All search params:", params);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full neumorphic-card p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-dm-sans mb-2">Welcome to Premium!</h1>
        <p className="text-white/70 mb-4">
          Your subscription is now active. You'll receive your first weekly
          digest on Monday.
        </p>

        <div className="text-sm text-white/50 space-y-2 mb-6">
          <p>✓ 4-5 detailed startup failure stories weekly</p>
          <p>✓ In-depth analysis of what went wrong</p>
          <p>✓ Only $2/month • Cancel anytime</p>
        </div>

        <a
          href="/"
          className="inline-block bg-white text-black px-6 py-2 rounded-lg font-dm-sans font-medium hover:bg-white/90 transition-colors"
        >
          Back to Homepage
        </a>

        <div className="mt-4 space-y-1">
          <p className="text-xs text-white/30">
            Payment completed successfully
          </p>
          {email && <p className="text-xs text-white/20">Email: {email}</p>}
          {sessionId &&
            sessionId !== "{CHECKOUT_SESSION_ID}" &&
            sessionId !== "{{CHECKOUT_SESSION_ID}}" &&
            sessionId !== "{checkout_session_id}" && (
              <p className="text-xs text-white/20">Session: {sessionId}</p>
            )}
        </div>
      </div>
    </div>
  );
}
