export default function Avatar({ name, size = 44 }) {

    const initials = name
        ? name
              .split(" ")
              .map(word => word[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : "?";

    return (

        <div
            style={{
                width: size,
                height: size
            }}
            className="rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
        >
            {initials}
        </div>

    );

}