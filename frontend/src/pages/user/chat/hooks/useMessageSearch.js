import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import ChatService from "../../../../services/ChatService";
import useDebounce from "../../../../hooks/useDebounce";

export default function useMessageSearch({ selectedFriendRef, messagesRef, paginationRef, loadOlderMessages }) {
    const [messageSearchOpen, setMessageSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const [resultsVisible, setResultsVisible] = useState(true);
    const [activeResultIndex, setActiveResultIndex] = useState(-1);
    const [jumpLoading, setJumpLoading] = useState(false);
    const [searchJump, setSearchJump] = useState({ messageId: null, version: 0 });

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const searchRequestIdRef = useRef(0);
    const searchJumpVersionRef = useRef(0);

    function openMessageSearch() {
        setMessageSearchOpen(true);
    }

    function closeMessageSearch() {
        searchRequestIdRef.current += 1;
        setMessageSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setSearching(false);
        setSearchError(false);
        setResultsVisible(true);
        setActiveResultIndex(-1);
        setJumpLoading(false);
        triggerJump(null);
    }

    function resetMessageSearch() {
        closeMessageSearch();
    }

    function triggerJump(messageId) {
        searchJumpVersionRef.current += 1;
        setSearchJump({
            messageId,
            version: searchJumpVersionRef.current
        });
    }

    async function selectSearchResult(message, index) {
        if (!message) return;
        setResultsVisible(false);
        if (index != null) setActiveResultIndex(index);

        const isLoaded = () =>
            messagesRef.current.some(item => item.id === message.id);

        if (isLoaded()) {
            triggerJump(message.id);
            return;
        }

        setJumpLoading(true);
        try {
            for (let attempt = 0; attempt < 150; attempt++) {
                if (isLoaded()) break;
                const pagination = paginationRef.current;
                if (!pagination.friendId || !pagination.hasMore) break;
                if (pagination.loading) {
                    await new Promise(resolve => setTimeout(resolve, 60));
                    continue;
                }
                await loadOlderMessages();
                await new Promise(resolve => setTimeout(resolve, 40));
            }
        } finally {
            setJumpLoading(false);
        }

        if (isLoaded()) {
            triggerJump(message.id);
        } else {
            toast.error("Couldn't locate that message.");
        }
    }

    function goToResult(index) {
        if (searchResults.length === 0) return;
        const total = searchResults.length;
        const wrapped = ((index % total) + total) % total;
        selectSearchResult(searchResults[wrapped], wrapped);
    }

    function goToNextResult() {
        goToResult(activeResultIndex < 0 ? 0 : activeResultIndex + 1);
    }

    function goToPrevResult() {
        goToResult(activeResultIndex < 0 ? -1 : activeResultIndex - 1);
    }

    useEffect(() => {
        if (!messageSearchOpen) return undefined;
        const friend = selectedFriendRef.current;
        if (!friend) return undefined;

        const trimmed = debouncedSearchQuery.trim();
        if (!trimmed) {
            searchRequestIdRef.current += 1;
            setSearching(false);
            setSearchError(false);
            setSearchResults([]);
            setActiveResultIndex(-1);
            setResultsVisible(true);
            return undefined;
        }

        const requestId = ++searchRequestIdRef.current;
        let cancelled = false;

        setSearching(true);
        setSearchError(false);

        (async () => {
            try {
                const response = await ChatService.searchMessages(friend.id, trimmed);
                if (
                    cancelled ||
                    requestId !== searchRequestIdRef.current ||
                    selectedFriendRef.current?.id !== friend.id
                ) return;
                const data = Array.isArray(response.data?.data) ? response.data.data : [];
                setSearchResults([...data].reverse());
                setActiveResultIndex(-1);
                setResultsVisible(true);
            } catch {
                if (cancelled || requestId !== searchRequestIdRef.current) return;
                setSearchError(true);
                setSearchResults([]);
                setActiveResultIndex(-1);
            } finally {
                if (!cancelled && requestId === searchRequestIdRef.current) {
                    setSearching(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [debouncedSearchQuery, messageSearchOpen]);

    return {
        messageSearchOpen,
        searchQuery,
        setSearchQuery,
        searchResults,
        searching,
        searchError,
        resultsVisible,
        setResultsVisible,
        activeResultIndex,
        jumpLoading,
        searchJump,
        openMessageSearch,
        closeMessageSearch,
        resetMessageSearch,
        triggerJump,
        selectSearchResult,
        goToNextResult,
        goToPrevResult,
    };
}
