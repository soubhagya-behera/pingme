import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../ui/Card";
import Button from "../ui/Button";
import SearchInput from "./SearchInput";
import SearchResultCard from "./SearchResultCard";
import useDebounce from "../../hooks/useDebounce";
import UserService from "../../services/UserService";
import "./AddFriendModal.css";

export default function AddFriendModal({ open, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 300);

  // ✅ 1. Moved Hooks together up top. The early return condition is placed right before the JSX layout rendering.
  useEffect(() => {
    if (!open) {
      setKeyword("");
      setUsers([]);
    }
  }, [open]);

  useEffect(() => {
    // ✅ 6. Using .trim() to prevent whitespace-only search requests
    if (debouncedKeyword.trim().length < 2) {
      setUsers([]);
      return;
    }
    searchUsers();
  }, [debouncedKeyword]);

  // Early return rule check for modal visibility state
  if (!open) return null;

  // Core API Interaction Actions
  async function searchUsers() {
    // ✅ 2. Loading protection guard prevents concurrent duplicate searches
    if (loading) return;

    try {
      setLoading(true);
      const response = await UserService.searchUsers(debouncedKeyword);
      setUsers(response.data.data);
    } catch (error) {
      // ✅ 3. Improved UI error feedback handling for UX
      toast.error(
        error.response?.data?.message || "Unable to search users"
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest(user) {
    // ✅ 4. Double-click execution protection guard
    if (sending) return;

    try {
      setSending(true);
      await UserService.sendFriendRequest(user.id);
      toast.success("Friend Request Sent");
      // ✅ 5. Awaiting the search update sequentially
      await searchUsers(); 
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to send request"
      );
    } finally {
      setSending(false);
    }
  }

  async function accept(user) {
    // ✅ 4. Double-click execution protection guard
    if (sending) return;

    try {
      setSending(true);
      await UserService.acceptRequest(user.requestId);
      toast.success("Friend Request Accepted");
      // ✅ 5. Awaiting the search update sequentially
      await searchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to accept request"
      );
    } finally {
      setSending(false);
    }
  }

  async function reject(user) {
    // ✅ 4. Double-click execution protection guard
    if (sending) return;

    try {
      setSending(true);
      await UserService.rejectRequest(user.requestId);
      toast.success("Friend Request Rejected");
      // ✅ 5. Awaiting the search update sequentially
      await searchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to reject request"
      );
    } finally {
      setSending(false);
    }
  }

  async function cancel(user) {
    // ✅ 4. Double-click execution protection guard
    if (sending) return;

    try {
      setSending(true);
      await UserService.cancelRequest(user.requestId);
      toast.success("Friend Request Cancelled");
      // ✅ 5. Awaiting the search update sequentially
      await searchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to cancel request"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal-overlay">
      <Card className="modal-card">
        <h2 className="text-2xl font-bold">Add Friend</h2>

        <SearchInput
          value={keyword}
          onChange={setKeyword}
          loading={loading}
        />

        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
          {/* ✅ 6. Synchronized layout trim update */}
          {users.length === 0 && debouncedKeyword.trim().length >= 2 && !loading ? (
            <div className="text-center py-8 text-slate-500">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <SearchResultCard
                key={user.id}
                user={user}
                sending={sending}
                onSend={sendRequest}
                onAccept={accept}
                onReject={reject}
                onCancel={cancel}
              />
            ))
          )}
        </div>

        <Button variant="danger" onClick={onClose}>
          Close
        </Button>
      </Card>
    </div>
  );
}