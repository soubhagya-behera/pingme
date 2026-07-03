import { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {

    const [open, setOpen] = useState(false);

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    return (

        <div className="relative">

            <button

                onClick={() => setOpen(!open)}

                className="flex items-center justify-center w-11 h-11 rounded-full border"

            >

                <User size={24} />

            </button>

            {

                open && (

                    <div

                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border p-4 z-50"

                    >

                        <h3 className="font-bold text-lg">

                            {user?.name}

                        </h3>

                        <p className="text-sm text-gray-500">

                            {user?.email}

                        </p>

                        <hr className="my-4"/>

                        <button

                            className="flex items-center gap-3 w-full py-2"

                            onClick={() => navigate("/profile")}

                        >

                            <User size={18}/>

                            My Profile

                        </button>

                        <button

                            className="flex items-center gap-3 w-full py-2"

                            onClick={() => navigate("/settings")}

                        >

                            <Settings size={18}/>

                            Settings

                        </button>

                        <button

                            className="flex items-center gap-3 w-full py-2 text-red-500"

                            onClick={handleLogout}

                        >

                            <LogOut size={18}/>

                            Logout

                        </button>

                    </div>

                )

            }

        </div>

    );

}