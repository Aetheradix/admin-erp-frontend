import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="login-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Login</h1>
      <p>Please log in to access the ERP</p>
      <button onClick={login} style={{ padding: '10px 20px', fontSize: '16px' }}>Login</button>
    </div>
  );
};

export default LoginPage;
