import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import routes from '../routes';
import models from '../models';

import { errorHandler } from '../middlewares/responseHandlers';
import { NotFoundError } from '../middlewares/errors';

const app = express();

app.use(express.static(path.join(__dirname, '../../uploads')));
app.use(helmet());
app.use(fileUpload());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use('/', routes);

app.all('*', (req, res, next) => {
  throw new NotFoundError('The Route you are requesting for does not exist');
});

app.use(errorHandler);

export default app;
