import { useEffect, useState } from "react";
import FriendService from "../../services/FriendService";
import {
    connectSocket,
    disconnectSocket
} from "../../websocket/socket";

import {
    subscribeFriendRequests
} from "../../websocket/subscriptions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AddFriendModal from "../../components/friends/AddFriendModal";
import "./Friends.css";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {

    loadFriends();

    let friendRequestSubscription;

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

    });

    return () => {

        friendRequestSubscription?.unsubscribe();

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

    <Button>

        Message

    </Button>

</Card>
        ))}
      </div>

      <AddFriendModal open={open} onClose={() => setOpen(false)} />

    </div>
  );
}