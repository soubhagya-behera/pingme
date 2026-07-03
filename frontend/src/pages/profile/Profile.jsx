import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {

    const { user } = useAuth();

    return (

        <Card className="p-8">

            <h1 className="text-3xl font-bold">

                My Profile

            </h1>

            <div className="mt-8 space-y-4">

                <p>

                    <b>Name :</b> {user?.name}

                </p>

                <p>

                    <b>Email :</b> {user?.email}

                </p>

                <p>

                    <b>Role :</b> {user?.role}

                </p>

            </div>

        </Card>

    );

}