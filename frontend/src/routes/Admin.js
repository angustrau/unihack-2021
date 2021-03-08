import { useState, useCallback } from 'react';
import {
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faMap, faChartBar, faSun } from '@fortawesome/free-regular-svg-icons'
import AdminDashboard from './AdminDashboard';
import AdminAlerts from './AdminAlerts';
import AdminAnalytics from './AdminAnalytics';
import './Admin.css';
import johnPhoto from './../john.jpg';
import angusPhoto from './../angus.jpg';
import jossPhoto from './../joss.jpg';
import kushPhoto from './../kush.jpg';

const users = [
  {
    photo: johnPhoto,
    name: 'John Bui',
    email: 'jbui@gmail.com'
  },
  {
    photo: angusPhoto,
    name: 'Angus Trau',
    email: 'me@angus.ws'
  },
  {
    photo: jossPhoto,
    name: 'Jossaline Tanasaldy',
    email: 'jossaline@gmail.om'
  },
  {
    photo: kushPhoto,
    name: 'Kushagr Mittal',
    email: 'kushagr@outlook.com.au'
  }
];

function Admin() {
  const [user, setUser] = useState(0);
  const [alerts, setAlerts] = useState(3);
  const details = users[user];

  const switchUser = useCallback(() => {
    setUser(u => (u + 1) % users.length)
  }, []);

  return (
    <div className="admin-body">
      <div className="admin-sidebar">
        <div className="admin-title">
          WELCOME BACK
        </div>
        <img className="admin-photo" src={details.photo} alt="profile" onClick={switchUser} />
        <div className="admin-name">
          {details.name}
        </div>
        <div className="admin-email">
          {details.email}
        </div>
        <div className="admin-filler" />
        <Link className="admin-button" to="/admin/alerts">
          <FontAwesomeIcon className="admin-icon" icon={faBell} />
          Alerts
          <span className="admin-alerts-count">
            {alerts}
          </span>
        </Link>
        <div className="admin-break" />
        <Link className="admin-button" to="/admin/dashboard">
          <FontAwesomeIcon className="admin-icon" icon={faMap} />
          Map
        </Link>
        <div className="admin-break" />
        <Link className="admin-button" to="/admin/analytics">
          <FontAwesomeIcon className="admin-icon" icon={faChartBar} />
          Analytics
        </Link>
        <div className="admin-break" />
        <div className="admin-button" to="/admin/system">
          <FontAwesomeIcon className="admin-icon" icon={faSun} />
          System
        </div>

      </div>
      <div className="admin-content">
        <Switch>
          <Route exact path="/admin">
            <Redirect to="/admin/login" />
          </Route>
          <Route exact path="/admin/dashboard">
            <AdminDashboard />
          </Route>
          <Route exact path="/admin/alerts">
            <AdminAlerts setAlerts={setAlerts} />
          </Route>
          <Route exact path="/admin/analytics">
            <AdminAnalytics />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default Admin;
