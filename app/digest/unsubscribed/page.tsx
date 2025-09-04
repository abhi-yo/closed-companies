export default async function DigestUnsubscribedPage({
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
            <h1 className="text-2xl font-dm-sans mb-2">
              Subscription cancelled
            </h1>
            <p className="text-white/70 mb-4">
              You won't receive any more weekly digests. Your subscription will
              remain active until the current billing period ends.
            </p>
            <p className="text-white/50 text-sm">
              Sorry to see you go! You can resubscribe anytime from the
              homepage.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-dm-sans mb-2">
              Unable to unsubscribe
            </h1>
            <p className="text-white/70">
              {error === "missing"
                ? "Missing token."
                : error === "invalid"
                ? "Invalid token."
                : "Something went wrong."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
