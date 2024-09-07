import {Grid3X3} from "lucide-react";
import React from "react";

const Header = ({courseTitle}) => (<header className="flex justify-between items-center p-4 border-b">
    <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Sarthi</h1>
    </div>
    <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full"><Grid3X3 size={24}/></button>
        <button className="w-8 h-8 bg-gray-300 rounded-full"></button>
    </div>
</header>
);
export default Header;
