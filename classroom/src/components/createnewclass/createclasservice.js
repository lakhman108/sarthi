import axios, { Axios } from "axios";

const addclass=(classname,teacherid,semester) =>{

    const body={
        courseName:classname,
        teacherId:teacherid,
        semester:semester,
    }
console.log(body);
axios.post('http://localhost:3000/api/courses',body).then((res)=>{console.log(res)});



};

export default addclass;
