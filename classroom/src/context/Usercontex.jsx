import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"

export const UserContext = createContext(null);

export const UserProvider = (props) => {
  const [user, setUser] = useState({});
  const savedtoken = Cookies.get('token');

  useEffect(() => {
    const isPageReload = window.performance.navigation.type === 1;

    if (isPageReload) {
      axios.get('http://localhost:3000/api/users', {
        headers: {
          Authorization: `Bearer ${savedtoken}`,
        },
      })
      .then((response) => {
        const userData = response.data;
        console.log(userData);
        userData.profilePictureImageLink = "https://avatars.githubusercontent.com/u/119241790?v=4";
        setUser(userData);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
  }, [savedtoken]);

  return (
    <UserContext.Provider value={{user, setUser}}>
      {props.children}
    </UserContext.Provider>
  );
}
