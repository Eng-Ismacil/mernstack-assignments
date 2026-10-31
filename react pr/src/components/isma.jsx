import { useState, useEffect } from "react";
import axios from React;

function Ismasprac(){
    const [users,setUsers]= useState([]);
    const [isLoading,setLoading]= useState(false);
    useEffect( ()=>{

        async function qaboHowl(){
            setLoading(true)
            const response = await axios.get("");
            const users = response.data;
            setUsers(users);
            console.log(users)
            setLoading(false);
            
        }
        qaboHowl();
    },[]);

     return(
        <>
        {
            isLoading ? (
                <h1>Loading...</h1>
            ) : (

                <div key={item.id}>
                    {users.map((item) => {
                        <div>
                        <h1>{item.name}</h1>
                        <p>{item.email}</p>
                        <p> {item.id} </p>
                        </div>
                    })}
                </div>

            )
        }
        </>
    )
};
export default Ismasprac;