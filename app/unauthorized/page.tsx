export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-red-600">403</h1>
        <h2 className="text-2xl font-semibold">Unauthorized Access</h2>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <a href="/" className="text-primary hover:underline">
            Go Home
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="/login" className="text-primary hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  )
}
