export const RTC_CONFIG = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302"
            ]
        }
    ],
    iceCandidatePoolSize: 10
};

export const CALL_TIMEOUT_SECONDS = 45;

export function getRtcConfiguration() {
    return {
        ...RTC_CONFIG,
        iceServers: RTC_CONFIG.iceServers
    };
}