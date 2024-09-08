import { Plus } from "lucide-react";
import React, { useContext } from "react";
import { UserContext } from "../../context/Usercontex";

const Header = ({ courseTitle }) => {

    const usercontex = useContext(UserContext);

    return (<header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Sarthi</h1>
        </div>
        <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full"><Plus /></button>
            <img className="w-8 h-8 rounded-full" src={usercontex.user.profilePictureImageLink}></img>
        </div>
    </header>
    )
};
export default Header;
