import { useState } from "react";
import toast from "react-hot-toast";

import "./AddFriendModal.css";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

import UserService from "../../services/UserService";

export default function AddFriendModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  // -------------------------
  // Search User
  // -------------------------
  async function searchUser() {
    if (email.trim() === "") {
      toast.error("Enter an email");
      return;
    }

    try {
      setLoading(true);
      const response = await UserService.searchUser(email);
      setUser(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Close Modal
  // -------------------------
  function handleClose() {
    setEmail("");
    setUser(null);
    onClose();
  }

  // -------------------------
  // Send Friend Request
  // -------------------------
  async function sendRequest() {
    try {
      setSending(true);
      await UserService.sendFriendRequest(user.id);
      toast.success("Friend Request Sent");
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send request");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal-overlay">
      <Card className="modal-card">
        <h2>Add Friend</h2>

        <Input
          placeholder="Enter Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchUser();
            }
          }}
        />

        <Button disabled={loading} onClick={searchUser}>
          {loading ? "Searching..." : "Search"}
        </Button>

        {user && (
          <div className="user-card">
            <div className="avatar">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{user.fullName}</h3>
              <p>{user.email}</p>
              <p>{user.profession}</p>
            </div>
            <Button disabled={sending} onClick={sendRequest}>
              {sending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        )}

        <Button className="close-btn" onClick={handleClose}>
          Close
        </Button>
      </Card>
    </div>
  );
}