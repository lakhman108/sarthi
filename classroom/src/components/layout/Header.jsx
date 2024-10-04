import { Plus } from "lucide-react";
import React, { useContext, useState } from "react";
import { UserContext } from "../../context/Usercontex";
import ClassModal from "../createnewclass/ClassModal";

const Header = ({ refresh }) => {
  const usercontex = useContext(UserContext);

  console.log(usercontex.user.role);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
const [JoinClassModal,setJoinClassModal]=useState(false);
  const handleCloseModal = () => {
    setIsCreateClassModalOpen(false);
  };

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Sarthi</h1>
      </div>
      <div className="flex items-center space-x-4">
        {
        usercontex.user.role == "teacher" && <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => {setIsCreateClassModalOpen(true); }}
        >

        </button>
        }
        {
        usercontex.user.role == "student"
        &&
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
            onClick={() => {setJoinClassModal(true); }}
        >
          <Plus />
        </button>

        }

        <ClassModal
          isCreateClassModalOpen={isCreateClassModalOpen}
          onClose={handleCloseModal}
          teacherId={usercontex.user._id}
          refresh={refresh}
        />
        <img
          className="w-8 h-8 rounded-full"
          src={usercontex.user.profilePictureImageLink}
          alt="User Profile"
        />
      </div>
    </header>
  );
};

export default Header;
