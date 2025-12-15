import React from "react";


 const JoinClasses=({isJoinClassModalOpen})=>{

    return (
        isJoinClassModalOpen ?
        <div>
            <span>hello there how are you all doing </span>
        </div>
    :
    null
);

}

export default JoinClasses;
