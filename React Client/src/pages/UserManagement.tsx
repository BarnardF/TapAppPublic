import { useState, useEffect } from 'react';
import { adminAPI } from "../Api/adminAPI";
import { useNavigate } from 'react-router-dom';


interface User {
  email: string;
  role: 'user' | 'admin' | 'SuperAdmin';
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  //Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (!getToken()) throw new Error("Authentication required");
      const users = await adminAPI.getUsers(getToken()!);

      const filteredUsers = users.filter((user: User) => user.role !== 'SuperAdmin');

      setUsers(filteredUsers);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //Update user role
  const updateUserRole = async (email: string, newRole: string) => {
    try {
      setUpdating(email);
      setError('');
      setSuccess('');
      if (!getToken()) throw new Error("Authentication required");
      await adminAPI.updateUserRole(getToken()!, email, newRole);
      setSuccess(`Successfully updated ${email} to ${newRole}`);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  //Delete user
  const deleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      setError('');
      setSuccess('');
      if (!getToken()) throw new Error("Authentication required");
      await adminAPI.deleteUser(getToken()!, email);
      setSuccess(`Successfully deleted ${email}`);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    const styles = {
      SuperAdmin: 'bg-purple-100 text-purple-800 border-purple-300',
      admin: 'bg-blue-100 text-blue-800 border-blue-300',
      user: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return styles[role as keyof typeof styles] || styles.user;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
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
                onClick={() => navigate(-1)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-blue-400 duration-200 font-medium"
              >
                ← Go Back
              </button>
              
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage user roles and permissions</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Current Role Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Role Selection Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.email, e.target.value)}
                        disabled={updating === user.email}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="user">user (unverified)</option>
                        <option value="admin">admin (verified)</option>
                      </select>
                    </td>

                    {/* Registration Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    {/* Delete Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.email)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updating === user.email}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* Role Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Role Permissions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>user (unverified):</strong> Can only browse public content. Cannot access admin dashboard.</p>
            <p><strong>admin (verified):</strong> Can access dashboard and manage taps (create, edit, delete).</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Users
          </button>
        </div>
      </div>
    </div>
  );
}