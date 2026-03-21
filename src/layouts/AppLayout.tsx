import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="header" style={{ height: '60px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <h1>Aetheradix ERP</h1>
        <button onClick={logout}>Logout</button>
      </header>
      <div className="main-container" style={{ display: 'flex', flex: 1 }}>
        <aside className="sidebar" style={{ width: '250px', borderRight: '1px solid #ddd', padding: '20px' }}>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li style={{ marginTop: '20px' }}><Link to="/profile">Profile</Link></li>
            </ul>
          </nav>
        </aside>
        <main className="outlet" style={{ flex: 1, padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
