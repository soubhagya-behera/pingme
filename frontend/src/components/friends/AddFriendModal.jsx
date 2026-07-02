import "./AddFriendModal.css";

import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

import UserService from "../../services/UserService";

import toast from "react-hot-toast";

export default function AddFriendModal({

open,

onClose

}){

const[email,setEmail]=useState("");

const[user,setUser]=useState(null);

const[loading,setLoading]=useState(false);

if(!open) return null;

async function searchUser(){

try{

setLoading(true);

const response=

await UserService.searchUser(email);

setUser(response.data.data);

}
catch{

toast.error("User not found");

setUser(null);

}
finally{

setLoading(false);

}

}

return(

<div className="modal-overlay">

<Card className="modal-card">

<h2>

Add Friend

</h2>

<Input

placeholder="Enter Email"

value={email}

onChange={(e)=>

setEmail(e.target.value)

}

/>

<Button

onClick={searchUser}

>

{

loading?

"Searching..."

:

"Search"

}

</Button>

{

user&&(

<div className="user-card">

<h3>

{user.fullName}

</h3>

<p>

{user.email}

</p>

<p>

{user.profession}

</p>

<Button>

Send Request

</Button>

</div>

)

}

<Button

className="close-btn"

onClick={onClose}

>

Close

</Button>

</Card>

</div>

);

}