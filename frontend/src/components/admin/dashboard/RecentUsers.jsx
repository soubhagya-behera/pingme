import Card from "../../ui/Card";

export default function RecentUsers({ users = [] }) {

    return (

        <Card className="p-6">

            <h2 className="text-xl font-semibold mb-5">
                Recent Users
            </h2>

            {users.length === 0 ? (

                <p className="text-[var(--text-secondary)]">
                    No users found.
                </p>

            ) : (

                <div className="space-y-4">

                    {users.map(user => (

                        <div
                            key={user.id}
                            className="flex items-center justify-between border-b pb-3"
                        >

                            <div>

                                <p className="font-semibold">
                                    {user.fullName}
                                </p>

                                <p className="text-sm text-[var(--text-secondary)]">
                                    {user.email}
                                </p>

                            </div>

                            <span
                                className="
                                text-xs
                                bg-indigo-100
                                text-indigo-700
                                px-3
                                py-1
                                rounded-full
                                "
                            >
                                {user.status}
                            </span>

                        </div>

                    ))}

                </div>

            )}

        </Card>

    );

}