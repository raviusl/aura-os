export async function GET() {
  return Response.json({
    status: "ok",
    service: "aura-os",
    timestamp: new Date().toISOString(),
  });
}
