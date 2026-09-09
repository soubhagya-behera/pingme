import { useState, useRef } from "react";
import toast from "react-hot-toast";
import ChatService from "../../../../services/ChatService";
import { v4 as uuid } from "uuid";

export default function useChatAttachments({
    selectedFriend,
    replyingTo,
    setReplyingTo,
    setMessages,
    setScrollToBottomRequest,
}) {
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [attachmentCaption, setAttachmentCaption] = useState("");
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [attachmentError, setAttachmentError] = useState("");

    const [voicePreview, setVoicePreview] = useState(null);
    const [sendingVoice, setSendingVoice] = useState(false);
    const [voiceUploadProgress, setVoiceUploadProgress] = useState(0);
    const [voiceError, setVoiceError] = useState("");

    const [forwardingMessage, setForwardingMessage] = useState(null);
    const [forwarding, setForwarding] = useState(false);

    const uploadInFlight = useRef(false);

    function resetAttachmentPreview() {
        setSelectedAttachment(null);
        setAttachmentCaption("");
        setAttachmentError("");
        setUploadProgress(0);
    }

    async function sendAttachment() {
        let optimisticId = null;
        if (
            !selectedAttachment ||
            !selectedFriend ||
            uploadInFlight.current
        ) {
            return;
        }

        uploadInFlight.current = true;

        setUploadingAttachment(true);
        setUploadProgress(0);
        setAttachmentError("");

        try {
            let uploadResponse;

            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    uploadResponse = await ChatService.uploadFile(
                        selectedAttachment,
                        percent => {
                            setUploadProgress(percent);
                        }
                    );
                    break;
                } catch (err) {
                    if (
                        attempt === 1 ||
                        err?.response?.status
                    ) {
                        throw err;
                    }
                }
            }

            const attachment = uploadResponse.data?.data ?? uploadResponse.data;
            const payload = {
                clientId: uuid(),
                receiverId: selectedFriend.id,
                content: attachmentCaption.trim(),
                attachmentUrl: attachment.attachmentUrl,
                attachmentName: attachment.attachmentName,
                attachmentSize: attachment.attachmentSize,
                attachmentMimeType: attachment.attachmentMimeType,
                messageType: attachment.attachmentMimeType?.startsWith("image/") ? "IMAGE" : "FILE",
                replyToId: replyingTo?.id
            };
            const optimistic = {
                id: payload.clientId,
                ...payload,
                senderId: Number(localStorage.getItem("userId")),
                status: "SENDING",
                sentAt: new Date().toISOString()
            };
            if (replyingTo) optimistic.reply = replyingTo;
            optimisticId = optimistic.id;
            setMessages(previous => [...previous, optimistic]);
            setScrollToBottomRequest(request => request + 1);
            await ChatService.sendMessage(payload);
            toast.success("Attachment sent");
            resetAttachmentPreview();
            setReplyingTo(null);

        } catch (err) {
            if (optimisticId) setMessages(previous => previous.filter(message => message.id !== optimisticId));
            console.error(err);
            const errorMessage =
                err?.response?.data?.message ||
                "Attachment upload failed.";
            setAttachmentError(errorMessage);
            toast.error(errorMessage);
        } finally {
            uploadInFlight.current = false;
            setUploadingAttachment(false);
        }
    }

    function resetVoicePreview() {
        setVoicePreview(null);
        setVoiceError("");
        setVoiceUploadProgress(0);
    }

    async function sendVoiceMessage() {
        if (
            !voicePreview ||
            !selectedFriend ||
            uploadInFlight.current
        ) {
            return;
        }

        uploadInFlight.current = true;

        setSendingVoice(true);
        setVoiceUploadProgress(0);
        setVoiceError("");

        let optimisticId = null;

        try {
            const uploadResponse = await ChatService.uploadFile(
                voicePreview.file,
                percent => {
                    setVoiceUploadProgress(percent);
                }
            );

            const attachment = uploadResponse.data?.data ?? uploadResponse.data;
            const payload = {
                clientId: uuid(),
                receiverId: selectedFriend.id,
                content: "",
                attachmentUrl: attachment.attachmentUrl,
                attachmentName: attachment.attachmentName,
                attachmentSize: attachment.attachmentSize,
                attachmentMimeType: attachment.attachmentMimeType,
                attachmentDuration: voicePreview.duration,
                messageType: "VOICE",
                replyToId: replyingTo?.id
            };
            const optimistic = {
                id: payload.clientId,
                ...payload,
                senderId: Number(localStorage.getItem("userId")),
                status: "SENDING",
                sentAt: new Date().toISOString()
            };
            if (replyingTo) optimistic.reply = replyingTo;
            optimisticId = optimistic.id;
            setMessages(previous => [...previous, optimistic]);
            setScrollToBottomRequest(request => request + 1);
            await ChatService.sendMessage(payload);
            toast.success("Voice message sent");
            resetVoicePreview();
            setReplyingTo(null);

        } catch (err) {
            if (optimisticId) setMessages(previous => previous.filter(message => message.id !== optimisticId));
            console.error(err);
            const errorMessage =
                err?.response?.data?.message ||
                "Voice message upload failed.";
            setVoiceError(errorMessage);
            toast.error(errorMessage);
        } finally {
            uploadInFlight.current = false;
            setSendingVoice(false);
        }
    }

    async function forwardMessage(message, friend) {

    if (!message || !friend || forwarding) {
        return;
    }

    setForwarding(true);

    try {

        await ChatService.forwardMessage(
            message.id,
            friend.id
        );

        toast.success(
            `Message forwarded to ${friend.fullName}`
        );

        setForwardingMessage(null);

    } catch (error) {

        console.error(
            "Forward message failed:",
            error
        );

        toast.error(
            error?.response?.data?.message ||
            "Couldn't forward the message."
        );

    } finally {

        setForwarding(false);

    }
}

    return {
        selectedAttachment,
        setSelectedAttachment,
        attachmentCaption,
        setAttachmentCaption,
        uploadingAttachment,
        uploadProgress,
        attachmentError,
        setAttachmentError,
        setUploadProgress,
        voicePreview,
        setVoicePreview,
        sendingVoice,
        voiceUploadProgress,
        setVoiceUploadProgress,
        voiceError,
        setVoiceError,
        forwardingMessage,
        setForwardingMessage,
        forwarding,
        resetAttachmentPreview,
        sendAttachment,
        resetVoicePreview,
        sendVoiceMessage,
        forwardMessage,
    };
}
