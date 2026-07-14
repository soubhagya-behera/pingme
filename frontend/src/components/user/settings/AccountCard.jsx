import { useEffect, useState } from "react";
import UserService from "../../../services/UserService";
import Input from "../../ui/Input";

export default function AccountCard() {
    const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {

    try {

        const response =
            await UserService.getProfile();

        setProfile(response.data.data);

    }

    catch (error) {

        console.error(error);

    }

    finally {

        setLoading(false);

    }

}

    if (loading) {

    return <div>Loading...</div>;

}

if (!profile) {

    return (

        <div className="text-red-500">

            Unable to load profile.

        </div>

    );

}

    return (
        <div className="grid grid-cols-2 gap-6">
            <Input
                label="Full Name"
                value={profile.fullName}
                disabled
            />
            <Input
                label="Email"
                value={profile.email}
                disabled
            />
            <Input
                label="Profession"
                value={profile.profession || ""}
                disabled
            />
            <Input
                label="Phone"
                value={profile.phone || ""}
                disabled
            />
        </div>
    );
}