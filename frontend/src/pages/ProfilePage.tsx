import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";



const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-primary text-rose-500 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-sm opacity-90 mt-2">
            Manage your account settings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Info Card */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Account Information
          </h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <label className="text-sm font-semibold text-gray-600">
                Username
              </label>
              <p className="text-lg text-gray-800 mt-1">
                {user?.username || "Not set"}
              </p>
            </div>

            <div className="border-b pb-4">
              <label className="text-sm font-semibold text-gray-600">
                Email
              </label>
              <p className="text-lg text-gray-800 mt-1">{user?.email}</p>
            </div>

            {/* <div className="border-b pb-4">
              <label className="text-sm font-semibold text-gray-600">
                Member Since
              </label>
              <p className="text-lg text-gray-800 mt-1">2024-01-15</p>
            </div> */}

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Last Login
              </label>
              <p className="text-lg text-gray-800 mt-1">Just now</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Account Actions
          </h2>
          <button className="btn btn-primary w-full" onClick={handleLogout}>
            Logout
          </button>
        </div>

       
      </div>
    </div>
  );
};

export default ProfilePage;
