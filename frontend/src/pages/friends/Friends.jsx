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

import ConfirmModal from "../../components/ui/ConfirmModal";
import FriendStats from "../../components/friends/FriendStats";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [removeFriend, setRemoveFriend] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {

    async function initialize() {

    await loadFriends();

}

initialize();

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
        toast.success(
    `${removeFriend.fullName} has been removed from your friends.`
);

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
        <h1>Friends</h1>
        <Button onClick={() => setOpen(true)}>+ Add Friend</Button>
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
    disabled={removing}
    onClick={() => setRemoveFriend(friend)}
>
    Remove
</Button>   

</div>

</Card>
        ))}
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