export default function UserAvatar({ name, size = "default" }) {

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
                rounded-lg
                bg-indigo-600
                font-semibold
                text-white
                ${dimensions}
            `}
        >
            {initials || "U"}
        </span>
    );

}