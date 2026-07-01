import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";

import {

    Mail,

    Lock

} from "lucide-react";

function App() {

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">

            <Card

                hover

                className="w-full max-w-md p-8 space-y-6"

            >

                <h1 className="text-3xl font-bold">

                    Welcome Back 👋

                </h1>

                <p className="text-slate-500">

                    Login to continue chatting.

                </p>

                <Input

                    label="Email"

                    icon={<Mail size={20}/>}

                    placeholder="Enter email"

                />

                <Input

                    label="Password"

                    icon={<Lock size={20}/>}

                    type="password"

                    placeholder="Enter password"

                />

                <Button className="w-full">

                    Login

                </Button>

            </Card>

        </div>

    );

}

export default App;