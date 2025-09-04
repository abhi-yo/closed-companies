export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const ok = params?.ok;
  const error = params?.error;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full neumorphic-card p-6 text-center">
        {ok ? (
          <>
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
            <h1 className="text-2xl font-dm-sans mb-2">
              Email confirmed!
            </h1>
            <p className="text-white/70 mb-6">
              Welcome to Closed Companies newsletter. You'll receive our latest startup failure stories.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
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
            <h1 className="text-2xl font-dm-sans mb-2">
              Confirmation failed
            </h1>
            <p className="text-white/70 mb-6">
              {error === "missing"
                ? "No confirmation token provided."
                : error === "invalid"
                ? "Invalid or expired confirmation token."
                : "Something went wrong. Please try again."}
            </p>
          </>
        )}

        <a
          href="/"
          className="inline-block bg-white text-black px-6 py-2 rounded-lg font-dm-sans font-medium hover:bg-white/90 transition-colors"
        >
          Back to Homepage
        </a>
      </div>
    </div>
  );
}
