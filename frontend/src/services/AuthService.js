import api from "../api/axios";

const AuthService={

login(data){

    return api.post(

        "/auth/login",

        data

    );

},

register(data){

    return api.post(

        "/auth/register",

        data

    );

}

};

export default AuthService;