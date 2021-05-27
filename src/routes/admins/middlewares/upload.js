const fs = require('fs');
import {
  successResponse,
  errorHandler,
} from '../../../middlewares/responseHandlers';

export const avatarMiddleware = async (req, res, next) => {
  try {
    var data = req.files.avatar;
    let path = './uploads/';
    if (!data) {
      throw Error('No file found');
    }

    if (!fs.existsSync(path)) {
      fs.mkdir(path, function(err) {
        if (err) {
          return req.log('failed to write directory', err);
        }
      });
    }
    let info = await req.models.admins.accounts.findById(req.account._id);
    let avatarStream = path + req.account._id + '.' + data.name.split('.')[1];

    await data.mv(avatarStream);
    info.avatar = process.env.BACKEND + avatarStream.split(path)[1];
    await info.save();
    return successResponse(res, 'Avatar Updated Successfully', '200', usr);
  } catch (error) {
    return errorHandler(error, '403', res, next);
  }
};
