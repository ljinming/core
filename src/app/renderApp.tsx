import App from "./index";
import {Provider} from 'react-redux';


export default (app: App):JSX.Element | void => {
        if(app.router){
            return <Provider store={app.store}> {app.router(app)} </Provider>;
        }
    
        throw new Error('app.setRouter() must be called  ')

}