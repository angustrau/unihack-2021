import './Index.css';
import { Link } from 'react-router-dom';
import logo from './../adiona.png';

function Index() {
  return (
    <div className="index-body">
      <div className="index-card">
        <img className="index-logo" src={logo} alt="logo" />
        <Link to="/admin" className="index-button">Admin UI</Link>
        <Link to="/kiosk/demo" className="index-button">Kiosk Demo</Link>

        <div className="index-text">
        Start the Kiosk first. The recommended browser resolution is 1280x1920 portrait. Your browser's dev tools will have features to adjust the resolution. The Demo Kiosk skips mask detection as it requires an external program. NFC and other hardware features are also disabled without a physical Kiosk.
        Log into the admin interface with any username/password.  
        </div>
      </div>
    </div>
  );
}

export default Index;
