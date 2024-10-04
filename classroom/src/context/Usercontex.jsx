import {createContext,useState} from "react";


 export  const UserContext=createContext(null);


export const UserProvider=(props)=>{

    const [user, setUser] = useState({"_id": "66d973c81d7654e9e6ef6980",
    "username": "pallavi_rana",
    "password": "password987",
    "profilePictureImageLink": "https://avatars.githubusercontent.com/u/119241790?v=4",
    "email": "pallavi.rana@email.com",
    "role": "teacher"}
);







   return  (
   <UserContext.Provider value={{user,setUser}}>
        { props.children }
    </UserContext.Provider>);
}
