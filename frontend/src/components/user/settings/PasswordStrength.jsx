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

        color = "text-[var(--danger)]";

    }

    else if (password.length < 12) {

        text = "Medium";

        color = "text-[var(--warning)]";

    }

    else {

        text = "Strong";

        color = "text-[var(--success)]";

    }

    return (

        <p className={`mt-2 text-sm ${color}`}>

            Password Strength : {text}

        </p>

    );

}
