import axios, { Axios } from "axios";
import Cookies from "js-cookie";
const addclass=(classname,teacherid,semester) =>{

    const body={
        courseName:classname,
        teacherId:teacherid,
        semester:semester,
    }
    const savedtoken=Cookies.get('token');

console.log(body);
axios.post('https://sarthibackend-production.up.railway.app/api/courses',body,{
    headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${savedtoken}`
    }
}).then((res)=>{console.log(res)});



};

export default addclass;
