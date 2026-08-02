const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";

export const ACCEPTED_ATTACHMENTS = [
  "image/jpeg", "image/png", "image/gif", "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip", "text/plain"
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

export function formatFileSize(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 1) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(Number(bytes)) / Math.log(1024)), units.length - 1);
  const value = Number(bytes) / (1024 ** index);
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

export function attachmentKind(attachment) {
  const mime = attachment?.attachmentMimeType || "";
  if (isImageAttachment(attachment)) return "photo";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word") || mime === "application/msword") return "document";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "spreadsheet";
  if (mime.includes("powerpoint") || mime.includes("presentation")) return "presentation";
  if (mime === "application/zip") return "zip";
  if (mime === "text/plain") return "text";
  return "file";
}

export function attachmentLabel(attachment) {
  return ({ photo: "Photo", pdf: "PDF", document: "Document", spreadsheet: "Spreadsheet", presentation: "Presentation", zip: "ZIP", text: "Text file", file: "File" })[attachmentKind(attachment)];
}
