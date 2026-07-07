import "./ActivateAccount.css";

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthService from "../../services/AuthService";

export default function ActivateAccount() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [checking, setChecking] = useState(true);

    const [validToken, setValidToken] = useState(false);

    const [loading, setLoading] = useState(false);

    const {

        register,

        handleSubmit,

        watch,

        formState:{errors}

    } = useForm();

    const password = watch("password");

    useEffect(() => {

        async function validate() {

            try{

                await AuthService.validateActivationToken(token);

                setValidToken(true);

            }catch(error){

                toast.error("Activation link is invalid or expired.");

            }finally{

                setChecking(false);

            }

        }

        if(token){

            validate();

        }else{

            setChecking(false);

        }

    },[token]);

    const onSubmit = async(data)=>{

        try{

            setLoading(true);

            await AuthService.setPassword({

                token,

                password:data.password

            });

            toast.success("Account Activated Successfully 🎉");

            setTimeout(()=>{

                navigate("/login");

            },2000);

        }catch(error){

            toast.error(

                error.response?.data?.message ||

                "Unable to activate account"

            );

        }finally{

            setLoading(false);

        }

    };

    if(checking){

        return(

            <div className="activate-page">

                <Card className="activate-card">

                    <h2>Checking activation link...</h2>

                </Card>

            </div>

        );

    }

    if(!validToken){

        return(

            <div className="activate-page">

                <Card className="activate-card">

                    <h2>Invalid or Expired Link</h2>

                    <p>Please contact the administrator.</p>

                </Card>

            </div>

        );

    }

    return(

        <div className="activate-page">

            <Card className="activate-card">

                <h1>Create Your Password</h1>

                <p>Your account has been approved.</p>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="form-group">

                        <Input

                            type="password"

                            placeholder="Password"

                            {

                            ...register("password",{

                                required:"Password required",

                                minLength:{

                                    value:8,

                                    message:"Minimum 8 characters"

                                }

                            })

                            }

                            error={errors.password?.message}

                        />

                    </div>

                    <div className="form-group">

                        <Input

                            type="password"

                            placeholder="Confirm Password"

                            {

                            ...register("confirmPassword",{

                                validate:(value)=>

                                    value===password ||

                                    "Passwords do not match"

                            })

                            }

                            error={errors.confirmPassword?.message}

                        />

                    </div>

                    <Button

                        type="submit"

                        className="w-full"

                        disabled={loading}

                    >

                        {

                            loading ?

                            "Creating Password..." :

                            "Activate Account"

                        }

                    </Button>

                </form>

            </Card>

        </div>

    );

}