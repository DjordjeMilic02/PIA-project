import express, { Router } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routes/user.routes';
import companyRouter from './routes/company.routes';
import zahteviRouter from './routes/zahtevi.routres';

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/projekat");
mongoose.connection.once('open', () => {
    console.log("db connection ok");
});

const router = Router();

router.use('/user', userRouter);
router.use('/company', companyRouter);
router.use('/zahtevi', zahteviRouter);

app.use('/', router);

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(4000, () => console.log(`Express server running on port 4000`));