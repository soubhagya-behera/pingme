import { ArrowDown, ArrowUp, List, Search, X } from "lucide-react";

function countLabel({
    query,
    searching,
    error,
    results,
    activeIndex,
    jumpLoading
}) {
    if (!query.trim()) return "";
    if (jumpLoading) return "Loading…";
    if (error) return "Search failed";
    if (searching) return "Searching…";
    if (results.length === 0) return "No messages found";
    if (activeIndex >= 0) return `${activeIndex + 1} of ${results.length}`;
    const suffix = results.length === 1 ? "" : "s";
    return `${results.length} result${suffix}`;
}

export default function ChatSearchBar({
    query,
    onQueryChange,
    onClose,
    onNext,
    onPrev,
    onToggleResults,
    resultsVisible,
    results,
    activeIndex,
    searching,
    error,
    jumpLoading,
    inputRef
}) {
    const hasResults = results.length > 0;
    const label = countLabel({
        query,
        searching,
        error,
        results,
        activeIndex,
        jumpLoading
    });

    return (
        <header className="chat-header chat-search-bar">
            <button
                type="button"
                className="chat-header-back is-visible"
                onClick={onClose}
                aria-label="Close message search"
                title="Close search"
            >
                <X size={20} />
            </button>

            <label className="chat-search-field">
                <Search size={17} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    placeholder="Search messages..."
                    aria-label="Search messages in this conversation"
                    autoComplete="off"
                    onChange={event => onQueryChange(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Escape") {
                            event.preventDefault();
                            if (resultsVisible && hasResults) {
                                onToggleResults();
                            } else {
                                onClose();
                            }
                        } else if (event.key === "Enter" || event.key === "ArrowDown") {
                            event.preventDefault();
                            onNext();
                        } else if (event.key === "ArrowUp") {
                            event.preventDefault();
                            onPrev();
                        }
                    }}
                />
            </label>

            <div className="chat-search-nav">
                {label && (
                    <span
                        className={`chat-search-count ${
                            !searching && !error && query.trim() && !hasResults
                                ? "is-empty"
                                : ""
                        } ${error ? "is-error" : ""}`}
                    >
                        {label}
                    </span>
                )}
                <button
                    type="button"
                    className="chat-search-nav-button"
                    onClick={onPrev}
                    disabled={!hasResults}
                    aria-label="Previous match"
                    title="Previous match"
                >
                    <ArrowUp size={18} />
                </button>
                <button
                    type="button"
                    className="chat-search-nav-button"
                    onClick={onNext}
                    disabled={!hasResults}
                    aria-label="Next match"
                    title="Next match"
                >
                    <ArrowDown size={18} />
                </button>
                <button
                    type="button"
                    className="chat-search-nav-button"
                    onClick={onToggleResults}
                    disabled={!hasResults}
                    aria-label={resultsVisible ? "Hide result list" : "Show result list"}
                    title={resultsVisible ? "Hide result list" : "Show result list"}
                >
                    <List size={18} />
                </button>
            </div>
        </header>
    );
}
