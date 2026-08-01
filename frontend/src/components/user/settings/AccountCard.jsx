import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import UserService from "../../../services/UserService";

import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function AccountCard() {

    const [loading, setLoading] = useState(false);

    const [profile, setProfile] = useState({

        fullName: "",

        email: "",

        profession: "",

        phone: "",

        bio: "",

        role: "",

        emailVerified: false,

        createdAt: null,

        lastSeen: null

    });

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

            console.log(error);

        }

    }

    function handleChange(e) {

        setProfile({

            ...profile,

            [e.target.name]: e.target.value

        });

    }

    async function saveProfile(e) {

        e.preventDefault();

        try {

            setLoading(true);

            await UserService.updateProfile({

                fullName: profile.fullName,

                profession: profile.profession,

                phone: profile.phone,

                bio: profile.bio

            });

            toast.success(

                "Profile updated successfully."

            );

            await loadProfile();

        }

        catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Unable to update profile"

            );

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <form

            onSubmit={saveProfile}

            className="settings-form settings-account-form space-y-6"

        >

            <div className="settings-field-grid grid md:grid-cols-2 gap-6">

                <Input

                    label="Full Name"

                    name="fullName"

                    value={profile.fullName}

                    onChange={handleChange}

                />

                <Input

                    label="Email"

                    value={profile.email}

                    disabled

                />

                <Input

                    label="Profession"

                    name="profession"

                    value={profile.profession || ""}

                    onChange={handleChange}

                />

                <Input

                    label="Phone"

                    name="phone"

                    value={profile.phone || ""}

                    onChange={handleChange}

                />

                <Input

                    label="Role"

                    value={

                        profile.role === "ADMIN"

                            ? "Administrator"

                            : "User"

                    }

                    disabled

                />

                <Input

                    label="Email Verified"

                    value={

                        profile.emailVerified

                            ? "Verified"

                            : "Not Verified"

                    }

                    disabled

                />

                <Input

                    label="Member Since"

                    value={

                        profile.createdAt

                            ? new Date(

                                  profile.createdAt

                              ).toLocaleDateString()

                            : ""

                    }

                    disabled

                />

                <Input

                    label="Last Seen"

                    value={

                        profile.lastSeen

                            ? new Date(

                                  profile.lastSeen

                              ).toLocaleString()

                            : "Online"

                    }

                    disabled

                />

            </div>

            <div className="settings-bio-field">

                <label className="block mb-2 font-medium text-[var(--text)]">

                    Bio

                </label>

                <textarea

                    name="bio"

                    value={profile.bio || ""}

                    onChange={handleChange}

                    rows={4}

                    className="settings-textarea w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--text)] placeholder:text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--primary)]"

                    placeholder="Tell everyone something about yourself..."

                />

            </div>

            <Button

                type="submit"

                disabled={loading}

                className="settings-submit-button"

            >

                {

                    loading

                        ? "Saving..."

                        : "Save Changes"

                }

            </Button>

        </form>

    );

}
