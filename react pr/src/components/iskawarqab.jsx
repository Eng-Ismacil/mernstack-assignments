import { useState, useEffect } from "react";
import axios from "axios";

function User() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3000/users");
                const data = response.data; // Waxaan u beddelay 'data' si uusan magacu ugu dhex kicin 'users' state-ka
                setUsers(data); // Halkan waa LA SAXAY (U weyn)
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false); // Halkan waa LA KUDARAY si uusan loading-ku u istaagin haddii uu error dhaco
            }
        }
        fetchUsers();
    }, []);

    return (
        <>
        {loading ? (
            <h1>loading</h1>
        ) : (
            <div className="max-w-7xl mx-auto px-6 py-10">
                {users.map((item) => {
                    return (
                        <div key={item.email} className="border-b py-2"> {/* Wax yar oo kala saarid ah */}
                            <p className="text-lg font-semibold">{item.name}</p>
                            <p className="text-lg font-semibold">{item.email}</p>
                            <p className="text-lg font-semibold">{item.password}</p>
                        </div>
                    )
                })}
            </div>
        )}
        </>
    );
}

export default User;