import { useEffect, useState } from "react";
import { attachmentUrl } from "../../user/chat/AttachmentUtils";

export default function UserAvatar({ name, src, size = "default" }) {

    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [src]);

    const imageSrc = attachmentUrl(src);

    const initials = name
        ?.split(" ")
        .map(part => part[0])
        .join("")
        .slice(0,2)
        .toUpperCase();

    const dimensions =
        size === "large"
            ? "h-14 w-14 text-lg"
            : "h-10 w-10 text-sm";

    return (
        <span
            className={`
                flex
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-lg
                bg-indigo-600
                font-semibold
                text-white
                ${dimensions}
            `}
        >
            {imageSrc && !imageFailed ? (
                <img
                    src={imageSrc}
                    alt={name || "user"}
                    onError={() => setImageFailed(true)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            ) : (
                initials || "U"
            )}
        </span>
    );

}