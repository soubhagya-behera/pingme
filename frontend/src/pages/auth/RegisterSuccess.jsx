import "./RegisterSuccess.css";

import { Link } from "react-router-dom";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function RegisterSuccess() {

    return (

        <div className="success-page">

            <Card className="success-card">

                <div className="success-icon">

                    ✅

                </div>

                <h1>

                    Registration Submitted

                </h1>

                <p className="success-text">

                    Thank you for joining

                    <strong> PingMe</strong>.

                    <br />

                    Your account has been created successfully.

                </p>

                <div className="status-box">

                    <h3>

                        Current Status

                    </h3>

                    <span className="status-badge">

                        ⏳ Pending Admin Approval

                    </span>

                    <p>

                        An administrator will review your account.

                        After approval you'll receive an activation email.

                    </p>

                </div>

                <Link to="/login">

                    <Button className="w-full">

                        Back to Login

                    </Button>

                </Link>

                <p className="help-text">

                    Need help?

                    <br />

                    support@pingme.com

                </p>

            </Card>

        </div>

    );

}