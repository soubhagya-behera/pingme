export default function ChatHeader({

friend

}){

return(

<div className="flex items-center gap-3 border-b p-5">

<div

className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center"

>

{

friend.fullName.charAt(0)

}

</div>

<div>

<h2 className="font-bold">

{friend.fullName}

</h2>

<p className={

friend.online

?

"text-green-500"

:

"text-slate-500"

}>

{

friend.online

?

"Online"

:

"Offline"

}

</p>

</div>

</div>

);

}