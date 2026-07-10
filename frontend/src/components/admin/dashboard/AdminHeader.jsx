import { useAuth } from "../../../context/AuthContext";

export default function AdminHeader() {

    const { user } = useAuth();

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (

        <div>

            <p className="text-sm uppercase font-semibold text-indigo-600">

                Admin Dashboard

            </p>

            <h1 className="mt-2 text-4xl font-bold">

                Welcome back, {user?.name?.split(" ")[0]} 👋

            </h1>

            <p className="mt-3 text-[var(--text-secondary)]">

                {today}

            </p>

        </div>

    );

}