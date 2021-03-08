import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Index from './routes/Index.js';
import Kiosk from './routes/Kiosk.js';
import CheckedIn from './routes/CheckedIn.js';
import AdminLogin from './routes/AdminLogin.js';
import Admin from './routes/Admin.js';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/thankyou">
          <CheckedIn />
        </Route>
        <Route exact path="/admin/login">
          <AdminLogin />
        </Route>
        <Route path="/admin">
          <Admin />
        </Route>
        <Route exact path="/kiosk">
          <Kiosk />
        </Route>
        <Route exact path="/kiosk/demo">
          <Kiosk demo />
        </Route>
        <Route exact path="/">
          <Index />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
