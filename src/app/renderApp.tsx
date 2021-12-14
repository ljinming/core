import App from "./index";
import {Provider} from 'react-redux';


export default (app: App):JSX.Element | void => {
    console.log('=======3',app)
        if(app.router){
            debugger
            return    <Provider store={app.store}>{app.router(app)} </Provider>
        }
    
        throw new Error('app.setRouter() must be called  ')

}