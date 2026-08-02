import { File, FileArchive, FileSpreadsheet, FileText, FileType2, Presentation } from "lucide-react";
import { attachmentKind } from "./AttachmentUtils";

export default function FileIcon({ attachment, size = 28 }) {
  const kind = attachmentKind(attachment);
  const Icon = kind === "pdf" ? FileType2 : kind === "document" ? FileText : kind === "spreadsheet" ? FileSpreadsheet : kind === "presentation" ? Presentation : kind === "zip" ? FileArchive : kind === "text" ? FileText : File;
  return <Icon size={size} aria-hidden="true" />;
}
