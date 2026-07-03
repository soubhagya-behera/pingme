import { useEffect, useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {

User,

Settings,

LogOut,

ChevronDown

} from "lucide-react";

import Avatar from "./Avatar";

import { useAuth } from "../../context/AuthContext";

import { useNavigate } from "react-router-dom";

export default function ProfileDropdown(){

const { user, logout } = useAuth();

const navigate = useNavigate();

const [open,setOpen]=useState(false);

const dropdownRef = useRef();

useEffect(()=>{

const handler=(e)=>{

if(

dropdownRef.current &&

!dropdownRef.current.contains(e.target)

){

setOpen(false);

}

};

document.addEventListener("mousedown",handler);

return()=>document.removeEventListener("mousedown",handler);

},[]);

const handleLogout=()=>{

logout();

navigate("/login");

};

return(

<div

className="relative"

ref={dropdownRef}

>

<button

onClick={()=>setOpen(!open)}

className="flex items-center gap-2"

>

<Avatar

name={user?.name}

size={42}

/>

<ChevronDown

size={18}

/>

</button>

<AnimatePresence>

{

open &&

(

<motion.div

initial={{

opacity:0,

y:-10,

scale:.95

}}

animate={{

opacity:1,

y:0,

scale:1

}}

exit={{

opacity:0,

y:-10,

scale:.95

}}

transition={{

duration:.2

}}

className="absolute right-0 mt-3 w-72 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-5 z-50"

>

<div className="flex items-center gap-4">

<Avatar

name={user?.name}

size={56}

/>

<div>

<h3 className="font-bold">

{user?.name}

</h3>

<p className="text-sm text-[var(--text-secondary)]">

{user?.email}

</p>

</div>

</div>

<hr className="my-4"/>

<button

className="dropdown-btn"

onClick={()=>navigate("/profile")}

>

<User size={18}/>

<span>My Profile</span>

</button>

<button

className="dropdown-btn"

onClick={()=>navigate("/settings")}

>

<Settings size={18}/>

<span>Settings</span>

</button>

<button

className="dropdown-btn text-red-500"

onClick={handleLogout}

>

<LogOut size={18}/>

<span>Logout</span>

</button>

</motion.div>

)

}

</AnimatePresence>

</div>

);

}