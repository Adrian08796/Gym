// src/components/Header.jsx
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Gym App</Link>
        <ul className="flex space-x-4">
          <li><Link to="/tracker">Workout Tracker</Link></li>
          <li><Link to="/exercises">Exercise Library</Link></li>
          <li><Link to="/plans">Workout Plans</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;