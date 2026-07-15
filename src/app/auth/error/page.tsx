export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        Authentication error
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We could not complete sign-in. Please try again or contact support if
        the problem continues.
      </p>
    </main>
  );
}
