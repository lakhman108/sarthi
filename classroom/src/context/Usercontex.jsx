import {createContext,useContext,useState} from "react";


 export  const UserContext=createContext(null);


export const UserProvider=(props)=>{

    const [user, setUser] = useState({"_id":"66d9726a1396cfd35c9b7e83","username":"rahul_verma","profilePictureImageLink":"https://avatars.githubusercontent.com/u/119241790?v=4","email":"rahul.verma@email.com","role":"teacher",
    });


   return  (
   <UserContext.Provider value={{user,setUser}}>
        { props.children }
    </UserContext.Provider>);
}
