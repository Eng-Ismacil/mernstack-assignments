// CILADA halkan ayay ahayd: Hubi inaad ku dartay { }
import { useState } from "react"; 

function Username() {
    const [username, setUsername] = useState("");

    const handelchange = (e) => {
        setUsername(e.target.value);
    }

    return (
        <div className="p-4 text-center"> 
            <input 
                type="text" 
                value={username} 
                onChange={handelchange} 
                placeholder="Geli magacaaga"
                className="border p-2 rounded"
            />
            <p className="mt-2 text-xl font-bold">username is :  {username || ""}</p>
        </div>
    )
}

export default Username;