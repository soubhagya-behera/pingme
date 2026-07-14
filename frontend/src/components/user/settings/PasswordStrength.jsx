export default function PasswordStrength({

    password

}) {

    let text = "";
    let color = "";

    if (!password) {

        return null;

    }

    if (password.length < 8) {

        text = "Weak";

        color = "text-red-500";

    }

    else if (password.length < 12) {

        text = "Medium";

        color = "text-yellow-500";

    }

    else {

        text = "Strong";

        color = "text-green-600";

    }

    return (

        <p className={`mt-2 text-sm ${color}`}>

            Password Strength : {text}

        </p>

    );

}