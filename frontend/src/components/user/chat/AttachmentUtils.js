const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";

export const ACCEPTED_ATTACHMENTS = [
  "image/jpeg", "image/png", "image/gif", "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip", "text/plain",
  "audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"
].join(",");

export function attachmentUrl(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`;
}

export function isImageAttachment(attachment) {
  return Boolean(
    attachment?.attachmentMimeType?.startsWith("image/")
    || attachment?.messageType === "IMAGE"
    || /\.(jpe?g|png|gif)(?:$|[?#])/i.test(attachment?.attachmentUrl || "")
  );
}

export function isAudioAttachment(attachment) {
  return Boolean(
    attachment?.attachmentMimeType?.startsWith("audio/")
    || /\.(webm|weba|ogg|oga|m4a|mp4|mp3|wav)(?:$|[?#])/i.test(attachment?.attachmentUrl || "")
  );
}

export function isVoiceMessage(attachment) {
  return Boolean(
    attachment?.messageType === "VOICE"
    || isAudioAttachment(attachment)
  );
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 1) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(Number(bytes)) / Math.log(1024)), units.length - 1);
  const value = Number(bytes) / (1024 ** index);
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

export function formatDuration(totalSeconds) {
  const total = Number(totalSeconds);
  if (!Number.isFinite(total) || total < 0) return "0:00";
  const seconds = Math.round(total);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder < 10 ? "0" : ""}${remainder}`;
}

export function voiceExtension(mimeType) {
  const mime = mimeType || "";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

export function attachmentKind(attachment) {
  const mime = attachment?.attachmentMimeType || "";
  if (isImageAttachment(attachment)) return "photo";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word") || mime === "application/msword") return "document";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "spreadsheet";
  if (mime.includes("powerpoint") || mime.includes("presentation")) return "presentation";
  if (mime === "application/zip") return "zip";
  if (mime === "text/plain") return "text";
  return "file";
}

export function attachmentLabel(attachment) {
  return ({ photo: "Photo", audio: "Audio", pdf: "PDF", document: "Document", spreadsheet: "Spreadsheet", presentation: "Presentation", zip: "ZIP", text: "Text file", file: "File" })[attachmentKind(attachment)];
}
