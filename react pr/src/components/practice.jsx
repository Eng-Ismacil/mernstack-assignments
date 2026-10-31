import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  // 1. Waxaan ka dhignay false (Boolean) maadaama uu loading yahay
  const [isLoading, setLoading] = useState(false); 

  useEffect(() => {
    async function fetchUsers() {
      try {
        // 2. Waxaan u wacnay sidii function: setLoading(true)
        setLoading(true); 
        const response = await axios.get("https://jsonplaceholder.typicode.com/users");
        const data = response.data;
        
        setUsers(data);
        setLoading(false);
        console.log("isma xogta wala so bandhigay", data);
      } catch (error) {
        console.error("Error fetching users:", error);
        // 3. Waxaan u saxnay xarafka weyn: setLoading
        setLoading(false); 
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-center mb-8">Users List</h1>

      {/* Haddii ay xogtu wali soo download-manayso (Loading) */}
      {isLoading ? (
        <div className="text-center text-xl text-blue-400">Loading...</div>
      ) : (
        // Haddii ay xogtu diyaar tahay, halkaan ayay ku dhex wareegaysaa (Grid Space)
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {users.map((user) => (
            
            // --- HALKAN WAA CARD-KII AAD CODSATAY ---
            <div key={user.id} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg transform transition hover:scale-[1.02]">
              <div className="space-y-3">
                {/* ID Section */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 uppercase tracking-wider font-semibold">User ID</span>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-mono text-sm">
                    {user.id}
                  </span>
                </div>

                {/* Name Section */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                  <h3 className="text-lg font-bold text-white truncate mt-0.5">
                    {user.name}
                  </h3>
                </div>

                {/* Line Kala Qaybiya */}
                <div className="border-t border-gray-700/60 my-2"></div>

                {/* Email Section */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email Address</p>
                  <p className="text-sm text-gray-300 truncate font-medium mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            // --- DHAMAADKA CARD-KA ---

          ))}
        </div>
      )}
    </div>
  );
}

export default Users;