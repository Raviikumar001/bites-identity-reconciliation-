import app from './app';
import { pool , createContactTable} from './db';

const init = async () => {
    await createContactTable();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};

init().catch(console.error);

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    pool.end().then(() => {
        console.log('Database pool closed.');
        process.exit(0);
    });
});