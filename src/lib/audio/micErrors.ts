export type MicErrorType =
  | "denied"
  | "notFound"
  | "notReadable"
  | "unsupported"
  | "unknown";

export function classifyMicError(error: unknown): MicErrorType {
  if (
    typeof navigator !== "undefined" &&
    (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
  ) {
    return "unsupported";
  }

  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
      case "SecurityError":
        return "denied";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "notFound";
      case "NotReadableError":
      case "TrackStartError":
        return "notReadable";
      default:
        return "unknown";
    }
  }

  return "unknown";
}
