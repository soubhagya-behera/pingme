import Input from "../ui/Input";

export default function SearchInput({

    value,

    onChange,

    loading

}){

    return(

        <div className="relative">

            <Input

                value={value}

                placeholder="Search by name or email..."

                onChange={(e)=>onChange(e.target.value)}

            />

            {

                loading &&

                <div

                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"

                >

                    Searching...

                </div>

            }

        </div>

    );

}