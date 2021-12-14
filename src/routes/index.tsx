import {BrowserRouter, Route, Switch} from 'react-router-dom';
import App from '@/app';
 import Home from '@/pages/home';
// import Login from '@/pages/login';

function RouteApp(app: App) {
  return (
    <BrowserRouter>
      <Switch>
        {/* <Route path='/login' exact component={Login} /> */}
        <Route path='/' component={Home}></Route> 
      </Switch>
    </BrowserRouter>
  );
}

export default RouteApp;