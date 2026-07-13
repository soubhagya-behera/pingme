import { useEffect, useState } from "react";
import FriendService from "../../services/FriendService";
import {
    connectSocket,
    disconnectSocket
} from "../../websocket/socket";

import {
    subscribeFriendRequests,
    subscribeFriends
} from "../../websocket/subscriptions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AddFriendModal from "../../components/friends/AddFriendModal";
import "./Friends.css";

import toast from "react-hot-toast";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {

    loadFriends();

    let friendRequestSubscription;

let friendsSubscription;
    

    connectSocket(() => {

        friendRequestSubscription =

            subscribeFriendRequests(

                async (event) => {

                    console.log(

                        "Friend Request Event",

                        event

                    );

                    if (

                        event.type === "ACCEPTED"

                    ) {

                        await loadFriends();

                    }

                }

            );

            friendsSubscription =

    subscribeFriends(

        async () => {

            console.log("Friend List Updated");

            await loadFriends();

        }

    );

    });

    return () => {

    friendRequestSubscription?.unsubscribe();

    friendsSubscription?.unsubscribe();

    disconnectSocket();

};

}, []);

  async function loadFriends() {
    try {
      const response = await FriendService.getFriends();
      setFriends(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(search.toLowerCase())
  );

  async function removeFriend(friendId) {

    const confirmed = window.confirm(

        "Are you sure you want to remove this friend?"

    );

    if (!confirmed) {

        return;

    }

    try {

        await FriendService.unfriend(friendId);

        // Instantly update UI
        setFriends(prev =>

            prev.filter(

                friend => friend.id !== friendId

            )

        );

    } catch (error) {

        toast.error(

    error.response?.data?.message ||

    "Unable to remove friend"

);

    }

}

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Friends</h1>
        <Button onClick={() => setOpen(true)}>+ Add Friend</Button>
      </div>

      <Input
        placeholder="Search Friend..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="friends-list">
        {filteredFriends.map((friend) => (
          <Card
    key={friend.id}
    className="friend-card"
    hover
>

    <div className="friend-info">

        <div className="friend-avatar">

            {friend.fullName.charAt(0).toUpperCase()}

            <span
                className={`online-dot ${
                    friend.online
                        ? "online"
                        : "offline"
                }`}
            />

        </div>

        <div>

            <h3>{friend.fullName}</h3>

            <p>

                {

                    friend.profession ||

                    "No Profession"

                }

            </p>

        </div>

    </div>

    <div className="flex gap-2">

    <Button>

        Message

    </Button>

    <Button

        variant="danger"

        onClick={() => removeFriend(friend.id)}

    >

        Remove

    </Button>

</div>

</Card>
        ))}
      </div>

      <AddFriendModal open={open} onClose={() => setOpen(false)} />

    </div>
  );
}