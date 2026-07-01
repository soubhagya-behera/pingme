import Button from "./components/ui/Button";
import Input from "./components/ui/Input";

import {

    Mail,

    Lock

} from "lucide-react";

function App() {

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center">

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl space-y-6">

                <h1 className="text-3xl font-bold text-slate-800">

                    PingMe

                </h1>

                <Input

                    label="Email"

                    icon={<Mail size={20}/>}

                    placeholder="Enter your email"

                />

                <Input

                    label="Password"

                    icon={<Lock size={20}/>}

                    type="password"

                    placeholder="Enter your password"

                />

                <Button className="w-full">

                    Login

                </Button>

            </div>

        </div>

    );

}

export default App;