import express from 'express';
import routes from './routes';
import { pool } from './db';

const app = express();
app.use(express.json());

app.use('/', routes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


export default app;