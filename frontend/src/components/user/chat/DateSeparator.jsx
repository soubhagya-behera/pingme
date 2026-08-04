export default function DateSeparator({ date }) {

    const today = new Date();

    const messageDate = new Date(date);

    const isToday =
        today.toDateString() ===
        messageDate.toDateString();

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
        yesterday.toDateString() ===
        messageDate.toDateString();

    let label;

    if (isToday) {

        label = "Today";

    } else if (isYesterday) {

        label = "Yesterday";

    } else {

        label = messageDate.toLocaleDateString([], {

            day: "numeric",

            month: "long",

            year:
                today.getFullYear() ===
                messageDate.getFullYear()

                    ? undefined

                    : "numeric"

        });

    }

    return (

        <div className="chat-date-separator">

            <span>

                {label}

            </span>

        </div>

    );

}