import { useEffect, useState } from "react";

import clsx from "clsx";

import { attachmentUrl } from "../user/chat/AttachmentUtils";

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";
}

export default function Avatar({
  name,
  src,
  size = 44,
  className = "",
  fill = false,
  alt,
  ...rest
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const imageSrc = attachmentUrl(src);
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <div
      style={!fill && size ? { width: size, height: size } : undefined}
      className={clsx(
        "flex items-center justify-center overflow-hidden font-bold",
        !fill && "rounded-full bg-indigo-600 text-white",
        fill && "h-full w-full",
        className
      )}
      {...rest}
    >
      {showImage ? (
        <img
          src={imageSrc}
          alt={alt || name || "avatar"}
          onError={() => setImageFailed(true)}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}