import { useAuth } from "../../context/AuthContext";

export default function DashboardHeader() {

    const { user } = useAuth();

    return (

        <div className="mb-8">

            <h1 className="text-4xl font-bold">

                Welcome,

                {" "}

                {user?.name}

                👋

            </h1>

            <p className="text-slate-500 mt-2">

                Stay connected with your friends.

            </p>

        </div>

    );

}