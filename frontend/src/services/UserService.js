import api from "../api/axios";

const UserService={

searchUser(email){

return api.get(

`/user/search?email=${email}`

);

}

};

export default UserService;