import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({

    children,

    roles

}){

    const{

        token,

        user

    }=useAuth();

    if(!token){

        return <Navigate to="/login"/>;

    }

    if(roles && !roles.includes(user?.role)){

        return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/"} replace/>;

    }

    return children;

}
