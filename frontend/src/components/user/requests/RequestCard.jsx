import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import {
    Clock3,
    Mail,
    CheckCircle2
} from "lucide-react";

export default function RequestCard({
    request,
    onAccept,
    onReject
}) {
    return (
        <Card
            hover
            className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
            <div className="flex gap-4 items-center">
                <div
                    className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--on-primary)] flex items-center justify-center text-2xl font-bold shadow-lg overflow-hidden"
                >
                    <Avatar
                        name={request.senderName}
                        src={request.senderProfilePicture}
                        fill
                    />
                    <span
                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                            request.senderOnline
                                ? "bg-green-500"
                                : "bg-gray-400"
                        }`}
                    />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold truncate">
                            {request.senderName}
                        </h2>
                        <span
                            className={`text-xs font-medium ${
                                request.senderOnline
                                    ? "text-[var(--success)]"
                                    : "text-[var(--text-secondary)]"
                            }`}
                        >
                            ● {request.senderOnline ? "Online" : "Offline"}
                        </span>
                    </div>

                    <p className="text-[var(--text-secondary)]">
                        {
                            request.senderProfession ||
                            "No Profession"
                        }
                    </p>

                    <div className="mt-2 flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-2">
                            <Mail size={14}/>
                            {request.senderEmail}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock3 size={14}/>
                            Received recently
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    className="flex items-center gap-2"
                    onClick={() =>
                        onAccept(
                            request.requestId
                        )
                    }
                >
                    <CheckCircle2 size={18}/>
                    Accept
                </Button>

                <Button
                    variant="danger"
                    onClick={() =>
                        onReject(
                            request.requestId
                        )
                    }
                >
                    Reject
                </Button>
            </div>
        </Card>
    );
}