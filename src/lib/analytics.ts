type FunnelEvent =
  | { name: "tool_started"; tool: string }
  | { name: "tool_completed"; tool: string; inRange: boolean }
  | { name: "package_built"; fileCount: number }

export function track(event: FunnelEvent) {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined
  if (!endpoint) return

  try {
    navigator.sendBeacon(
      endpoint,
      new Blob([JSON.stringify({ ...event, sentAt: Date.now() })], {
        type: "application/json",
      }),
    )
  } catch {
    // Analytics must never block or break the local workflow.
  }
}
