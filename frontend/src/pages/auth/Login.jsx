import "./Login.css";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import AuthService from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login(){

const{

register,

handleSubmit

}=useForm();
const navigate = useNavigate();

const { login } = useAuth();

const onSubmit = async (data) => {

    try {

        const response = await AuthService.login(data);

        const result = response.data.data;

        login(

            {
                id: result.id,
                name: result.fullName,
                email: result.email,
                role: result.role
            },

            result.token

        );

        toast.success("Login Successful");

        navigate(result.role === "ADMIN" ? "/admin" : "/");

    } catch (error) {

        toast.error(

            error.response?.data?.message ||

            "Login Failed"

        );

    }

};

return(

<div className="login-page">

<Card

className="login-card p-8"

>

<h1 className="login-title">

Welcome Back 👋

</h1>

<p className="login-subtitle">

Sign in to continue to PingMe

</p>

<form

onSubmit={handleSubmit(onSubmit)}

>

<div className="form-group">

<Input

placeholder="Email"

type="email"

{

...register("email")

}

/>

</div>

<div className="form-group">

<Input

placeholder="Password"

type="password"

{

...register("password")

}

/>

<div className="mt-2 flex justify-end">

    <Link
        to="/forgot-password"
        className="text-sm text-indigo-600 hover:underline"
    >
        Forgot Password?
    </Link>

</div>

</div>

<Button

type="submit"

className="w-full"

>

Login

</Button>

</form>

<div className="login-footer">

    <span>

        Don't have an account?

    </span>

    {" "}

    <Link

        to="/register"

        className="register-link"

    >

        Create Account

    </Link>

</div>

</Card>

</div>

);

}
