import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FriendService from "../../../services/FriendService";

// STEP 1: Added subscribePresence to imports
import { whenSocketConnected } from "../../../websocket/socket";
import {
    subscribeFriendRequests,
    subscribeFriends,
    subscribePresence
} from "../../../websocket/subscriptions";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Avatar from "../../../components/ui/Avatar";
import AddFriendModal from "../../../components/user/friends/AddFriendModal";
import "./Friends.css";

import toast from "react-hot-toast";

import ConfirmModal from "../../../components/ui/ConfirmModal";
import FriendStats from "../../../components/user/friends/FriendStats";
import { MessageCircle, Trash2, UserPlus } from "lucide-react";

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [removeFriend, setRemoveFriend] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {

    let friendRequestSubscription;
    let friendsSubscription;
    let presenceSubscription;

    async function initialize() {

        await loadFriends();

        whenSocketConnected(() => {

            friendRequestSubscription =
                subscribeFriendRequests(async (event) => {

                    if (event.type === "ACCEPTED") {

                        await loadFriends();

                    }

                });

            friendsSubscription =
                subscribeFriends(async () => {

                    await loadFriends();

                });

            presenceSubscription =
                subscribePresence(status => {

                    setFriends(previousFriends => {

                        const updatedFriends =
                            previousFriends.map(friend =>

                                friend.id === status.userId
                                    ? {
                                          ...friend,
                                          online: status.online
                                      }
                                    : friend

                            );

                        setStats({

                            totalFriends: updatedFriends.length,

                            onlineFriends:
                                updatedFriends.filter(f => f.online).length,

                            offlineFriends:
                                updatedFriends.filter(f => !f.online).length

                        });

                        return updatedFriends;

                    });

                });

        });

    }

    initialize();

    return () => {

        friendRequestSubscription?.unsubscribe();

        friendsSubscription?.unsubscribe();

        presenceSubscription?.unsubscribe();

    };

}, []);


  async function loadFriends() {
    try {
      const [
    friendsResponse,
    statsResponse
] = await Promise.all([
    FriendService.getFriends(),
    FriendService.getFriendStats()
]);

setFriends(
    friendsResponse.data.data
);
setStats(
    statsResponse.data.data
);
    } catch (error) {
      console.log(error);
    }
  }

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(search.toLowerCase())
  );

  async function confirmRemoveFriend() {
    if (!removeFriend) return;

    try {
      setRemoving(true);
        await FriendService.unfriend(removeFriend.id);

        setFriends(prev =>
            prev.filter(
                friend =>
                    friend.id !== removeFriend.id
            )
        );
        toast.success(`${removeFriend.fullName} has been removed from your friends.`);
        setRemoveFriend(null);
    } catch (error) {
    toast.error(
        error.response?.data?.message ||
        "Unable to remove friend"
    );
    setRemoveFriend(null);
} finally {
        setRemoving(false);
    }
}

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>

    Friends

    <span className="friend-total">

        ({friends.length})

    </span>

</h1>
        <Button onClick={() => setOpen(true)}>
            <UserPlus size={18}/>
            Add Friend
        </Button>
      </div>

      {
    stats &&
    <FriendStats
        stats={stats}
    />
}

      <Input
        placeholder="Search Friend..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="friends-list">
        {filteredFriends.length === 0 ? (
          <div className="friends-empty">
            <h3>No friends found</h3>
            <p>Try another search.</p>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <Card
              key={friend.id}
              className="friend-card"
              hover
            >
              <div className="friend-info">
                  <div className="friend-avatar">
                      <div className="friend-avatar-photo">
                          <Avatar
                              name={friend.fullName}
                              src={friend.profilePicture}
                              fill
                          />
                      </div>
                      <span
                          className={`online-dot ${
                              friend.online
                                  ? "online"
                                  : "offline"
                          }`}
                      />
                  </div>
                  <div className="friend-details">

                      <h3>
                          {friend.fullName}
                      </h3>

                      <p className="friend-profession">
                          {friend.profession || "No Profession"}
                      </p>

                      <span
                          className={
                              friend.online
                                  ? "friend-status online-text"
                                  : "friend-status offline-text"
                          }
                      >
                          {
                              friend.online
                                  ? "Online now"
                                  : "Offline"
                          }

                      </span>

                  </div>
              </div>

              <div className="flex gap-2">
              <Button
                  onClick={() =>
                      navigate("/chat", {
                          state: {
                              openFriendId: friend.id
                          }
                      })
                  }
              >
                  <MessageCircle size={17}/>
                  Message
              </Button>
                <Button
              variant="danger"
              disabled={removing}
              onClick={() => setRemoveFriend(friend)}
          >
              <Trash2 size={17}/>
              Remove
          </Button>   
          </div>
          </Card>
          ))
        )}
      </div>

      <AddFriendModal open={open} onClose={() => setOpen(false)} />
      <ConfirmModal
    open={removeFriend !== null}
    title="Remove Friend"
    message={`Are you sure you want to remove ${removeFriend?.fullName} from your friends? You can always send another friend request later.`}
    confirmText={removing ? "Removing..." : "Remove"}
    cancelText="Cancel"
    loading={removing}
    onCancel={() => !removing && setRemoveFriend(null)}
    onConfirm={confirmRemoveFriend}
/>
    </div>
  );
}