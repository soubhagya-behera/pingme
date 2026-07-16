import { useEffect, useState } from "react";

import {
    subscribeFriendRequests
} from "../../../websocket/subscriptions";
import FriendService from "../../../services/FriendService";

// Step 1: Added premium modular components and removed old Card/Button imports
import Input from "../../../components/ui/Input";
import RequestStats from "../../../components/user/requests/RequestStats";
import RequestCard from "../../../components/user/requests/RequestCard";
import EmptyRequests from "../../../components/user/requests/EmptyRequests";
import { whenSocketConnected } from "../../../websocket/socket";

export default function FriendRequests() {
    // Step 2: Added stats and search states alongside requests state
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {

    loadRequests();

    let subscription;

whenSocketConnected(() => {

    subscription = subscribeFriendRequests(async () => {

        await loadRequests();

    });

});

    return () => {

        subscription.unsubscribe();

    };

}, []);

    // Step 3: Upgraded to fetch both requests and stats asynchronously via Promise.all
    async function loadRequests() {
        try {
            const [requestsResponse, statsResponse] = await Promise.all([
                FriendService.getIncomingRequests(),
                FriendService.getRequestStats()
            ]);
            setRequests(requestsResponse.data.data);
            setStats(statsResponse.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function accept(id) {
        await FriendService.acceptRequest(id);
        loadRequests();
    }

    async function reject(id) {
        await FriendService.rejectRequest(id);
        loadRequests();
    }

    // Step 4: Real-time clientside filtering based on the search state
    const filteredRequests = requests.filter(request =>
        request.senderName.toLowerCase().includes(search.toLowerCase())
    );

    // Step 5: Rendered the redesigned view structure with stats cards, search bar, and empty states
    return (
        <div>
            <h1 className="text-4xl font-bold">Friend Requests</h1>
            <p className="text-slate-500 mb-8">Manage incoming friend requests</p>

            {stats && <RequestStats stats={stats} />}

            <Input
                placeholder="Search Requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="mt-8 space-y-5">
                {filteredRequests.length === 0 ? (
                    <EmptyRequests />
                ) : (
                    filteredRequests.map(request => (
                        <RequestCard
                            key={request.requestId}
                            request={request}
                            onAccept={accept}
                            onReject={reject}
                        />
                    ))
                )}
            </div>
        </div>
    );
}