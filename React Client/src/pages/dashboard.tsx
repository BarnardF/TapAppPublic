import { useEffect, useState } from "react";
import { adminAPI, type Tap } from "../Api/adminAPI";
import { useAuth } from "../Hooks/useAuth";
import TapCard from "../Components/TapCard";
import { useNavigate } from "react-router-dom";


//interface Tap {
  //id: string;
  //title: string;
  //container_type?: string;
  //material?: string;
  //size?: string;
  //flow_rate?: string;
  //liquid_type?: string;
  //description: string;
  //image_url: string;
//}

export default function Dashboard() {
  const token = useAuth();
  const [taps, setTaps] = useState<Tap[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTaps = async () => {
    try {
      setLoading(true);
      if (token) {
        const data = await adminAPI.getTaps(token);
        setTaps(data);
      }
    } catch (err) {
      console.error("Failed to fetch taps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm("Are you sure you want to delete this tap?")) {
      await adminAPI.deleteTap(token, id);
      fetchTaps();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchTaps();
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading taps...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header Bar */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* App Title - Clickable */}
            <button 
              onClick={() => navigate("/dashboard")}
              className="text-2xl font-bold hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors"
            >
              TheTapApp
            </button>
            
            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/form")}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-blue-400 duration-200 font-medium"
              >
                + Add Tap
              </button>
              
              {localStorage.getItem("role") === "SuperAdmin" && (
                <button
                  onClick={() => navigate("/users")}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-blue-400 duration-200 font-medium"
                >
                  Manage Users
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-blue-400 duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tap List:</h2>

        {/* Tap Grid */}
        {taps.length === 0 ? (
          <p className="text-gray-600 text-center mt-10">No taps available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {taps.map((tap) => (
              <TapCard
                key={tap.id}
                {...tap}
                onEdit={() => navigate(`/form?id=${tap.id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

