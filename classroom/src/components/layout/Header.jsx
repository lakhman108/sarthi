import { Plus, UserPlus } from "lucide-react";
import React, { useContext, useState } from "react";
import { UserContext } from "../../context/Usercontex";
import ClassModal from "../createnewclass/ClassModal";
import JoinClassroomModal from "../JoinClassroom/JoinClassroomModal";
import { useNavigate } from "react-router-dom";

const Header = ({ refresh }) => {
    const navigate=useNavigate();
  const usercontex = useContext(UserContext);
//   console.log(usercontex);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsCreateClassModalOpen(false);
  };

  const handleJoinSuccess = () => {
    refresh();
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-claude-200 bg-white">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-claude-900">Sarthi</h1>
      </div>
      <div className="flex items-center space-x-2">
        {usercontex.user.role === "teacher" && (
          <button
            className="p-2 hover:bg-claude-100 rounded-lg transition-colors"
            onClick={() => setIsCreateClassModalOpen(true)}
          >
            <Plus size={20} className="text-claude-700" />
          </button>
        )}
        {usercontex.user.role === "student" && (
          <button
            className="p-2 hover:bg-claude-100 rounded-lg transition-colors"
            onClick={() => setIsJoinClassModalOpen(true)}
          >
            <UserPlus size={20} className="text-claude-700" />
          </button>
        )}
        <ClassModal
          isCreateClassModalOpen={isCreateClassModalOpen}
          onClose={handleCloseModal}
          teacherId={usercontex.user._id}
          refresh={refresh}
        />
        <JoinClassroomModal
          isOpen={isJoinClassModalOpen}
          onClose={() => setIsJoinClassModalOpen(false)}
          onJoinSuccess={handleJoinSuccess}
        />
        <button onClick={()=>{navigate('/settings')}} className="ml-2">
        <img
          className="w-8 h-8 rounded-full ring-2 ring-claude-200"
          src={usercontex.user.profilePictureImageLink}
          alt="User Profile"
        />
        </button>
      </div>
    </header>
  );
};

export default Header;
