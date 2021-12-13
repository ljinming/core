import App from '@/app';
import routes from '@/routes';
// import models from '@/models';

const app = new App({
    onSuccess,
})

// app.setModels(models);
 app.setRouter(routes);
// app.start('#root');

// new Action(app)
