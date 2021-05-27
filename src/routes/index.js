import admins from './admins';
import models from '../models';
import express from 'express';

const router = express.Router();
router.use((req, res, next) => {
  req.models = models;
  next();
});
router.use('/administration', admins);

module.exports = router;
