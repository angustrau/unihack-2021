import { useCallback, useState } from 'react';
import { useHistory } from "react-router-dom";
import './AdminLogin.css';
import logo from './../adiona.png';

function AdminLogin() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const afterLoad = useCallback(() => {
    setLoading(false);
    history.push('/admin/dashboard');
  }, [history]);

  const onClick = useCallback(() => {
    setLoading(true);
    setTimeout(afterLoad, 500);
  }, [afterLoad]);

  return (
    <div className="login-body">
      <div className="login-panel">
        {/* <div className="login-logo">
          Adiona
        </div> */}
        <img className="login-logo" src={logo} alt="logo" />
        <div className="custom-input custom-input-container">
          <label className="custom-input" htmlFor="email">Email</label>
          <input className="custom-input login-email" id="email" type="text" />
        </div>
        <div className="custom-input custom-input-container">
          <label className="custom-input" htmlFor="password">Password</label>
          <input className="custom-input login-password" id="password" type="password" />
        </div>
        <button class="login-button" onClick={onClick}>
          {!loading ? 'SIGN IN' : <div className="loader" />}
        </button>
        <div className="login-sso">
          Sign in with education SSO
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
