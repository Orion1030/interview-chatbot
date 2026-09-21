export default function TempLinkExpiredPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Link Expired or Invalid</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This temporary access link has expired or is invalid.
        </p>
        <p className="text-sm">
          Please ask the admin to generate a new link for you.
        </p>
      </div>
    </div>
  )
}
