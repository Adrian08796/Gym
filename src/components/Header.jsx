import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // You might want to redirect to the login page after logout
    // If you're using react-router-dom v6, you can use the useNavigate hook for this
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Gym App</Link>
        <ul className="flex space-x-4 items-center">
          {user ? (
            <>
              <li><Link to="/tracker">Workout Tracker</Link></li>
              <li><Link to="/exercises">Exercise Library</Link></li>
              <li><Link to="/plans">Workout Plans</Link></li>
              <li><Link to="/workout-summary">Workout History</Link></li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;