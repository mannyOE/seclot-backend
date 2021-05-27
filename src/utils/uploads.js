/* eslint-disable babel/camelcase */
import cloud from 'cloudinary';
const fs = require('fs');
import { successResponse, errorHandler } from '../middlewares/responseHandlers';
import { isArray } from 'util';
const isDev = process.env.ENV === 'development';
const cloudinary = cloud.v2;
export const cloudinaryUpload = async (stream, path, override = {}) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    return cloudinary.uploader.upload(
      stream,
      {
        folder: path,
        ...override,
      },
      function(error, result) {
        //    console.log(error, result);
        return result.secure_url;
      }
    );
  } catch (err) {
    throw new Error(err);
  }
};

export const cloudinaryDestroy = async file => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    return cloudinary.uploader.destroy(file, function(error, result) {});
  } catch (err) {
    throw new Error(`Failed to this file ! Err:${err.message}`);
  }
};

export const avatarMiddleware = async (req, res, next) => {
  try {
    var data = req.files.avatar;
    let path = isDev ? './uploads/' : './temp/';
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
    let info;
    if (req.user.role === 'Tenant') {
      info = await req.models.Tenants.findOne({ _id: req.user.info }).select(
        'avatar'
      );
    } else if (req.user.role === 'Partner') {
      info = await req.models.Partners.findOne({ _id: req.user.info }).select(
        'avatar'
      );
    } else {
      info = await req.models.Admins.findOne({ _id: req.user.info }).select(
        'avatar'
      );
    }
    let avatarStream = path + req.user._id + '.' + data.name.split('.')[1];
    if (
      isDev &&
      info.avatar &&
      info.avatar.includes(process.env.LOCALBACKEND)
    ) {
      let df = info.avatar.split(process.env.LOCALBACKEND);
      let delPath = path + df[1];
      fs.unlinkSync(delPath);
    }
    await data.mv(avatarStream);

    if (!isDev) {
      let photo = await cloudinaryUpload(avatarStream, `profile/`, {});
      await cloudinaryDestroy(req.user.avatar);
      info.avatar = photo.secure_url;
    } else {
      info.avatar = process.env.LOCALBACKEND + avatarStream.split(path)[1];
    }
    await info.save();
    let usr = { ...req.user };
    usr.info = info;
    return successResponse(res, 'Avatar Updated Successfully', '00', usr);
  } catch (error) {
    return errorHandler(error, '02', res, next);
  }
};

export const facilityGalleryUpload = async (req, res, next) => {
  req.body.facility = JSON.parse(req.body.facility);
  var existsPhotos = req.method === 'PUT';
  let path = isDev ? './uploads/' : './temp/';
  if (!existsPhotos) {
    req.body.facility.gallery = [];
  }
  let goahead = false;
  if (!req.files && existsPhotos) {
    return next();
  }
  var galleryPhotos = req.files.gallery;
  if (!galleryPhotos && !existsPhotos) {
    throw Error('No photos found for this facility');
  }
  if (!fs.existsSync(path)) {
    fs.mkdir(path, function(err) {
      if (err) {
        return req.log('failed to write directory', err);
      }
    });
  }

  if (!fs.existsSync(`${path}gallery/`)) {
    fs.mkdir(`${path}gallery/`, function(err) {
      if (err) {
        return req.log('failed to write directory', err);
      }
    });
  }

  try {
    var gallery = [];
    if (isArray(galleryPhotos)) {
      for (let photo of galleryPhotos) {
        const streamPhoto = `${path}gallery/` + photo.name;
        await photo.mv(streamPhoto);
        let url = '';
        if (!isDev) {
          let photoUrl = await cloudinaryUpload(streamPhoto, `products/`, {});
          fs.unlinkSync(streamPhoto);
          url = photoUrl.secure_url;
        } else {
          url = process.env.LOCALBACKEND + streamPhoto.split(path)[1];
        }
        gallery.push({ url });
      }
    } else {
      const streamPhoto = `${path}gallery/` + galleryPhotos.name;
      await galleryPhotos.mv(streamPhoto);
      let url = '';
      if (!isDev) {
        let photoUrl = await cloudinaryUpload(streamPhoto, `products/`, {});
        fs.unlinkSync(streamPhoto);
        url = photoUrl.secure_url;
      } else {
        url = process.env.LOCALBACKEND + streamPhoto.split(path)[1];
      }
      gallery.push({ url });
    }
    req.body.facility.gallery = [...req.body.facility.gallery, ...gallery];
    return next();
  } catch (error) {
    return errorHandler(error, req, res, next);
  }
};

export const supportUpload = async (req, res, next) => {
  req.body.support = JSON.parse(req.body.support);
  var existsPhotos = req.method === 'PUT';
  let path = isDev ? './uploads/' : './temp/';
  if (!existsPhotos) {
    req.body.support.files = [];
  }
  let goahead = false;
  if (!req.files && existsPhotos) {
    return next();
  }
  if (!req.files && !existsPhotos) {
    return next();
  }
  var ticketFiles = req.files.ticket;
  if (!ticketFiles && !existsPhotos) {
    return next();
  }
  if (!fs.existsSync(path)) {
    fs.mkdir(path, function(err) {
      if (err) {
        return req.log('failed to write directory', err);
      }
    });
  }

  if (!fs.existsSync(`${path}support/`)) {
    fs.mkdir(`${path}support/`, function(err) {
      if (err) {
        return req.log('failed to write directory', err);
      }
    });
  }

  try {
    var files = [];
    if (isArray(ticketFiles)) {
      for (let photo of ticketFiles) {
        const streamPhoto = `${path}support/` + photo.name;
        await photo.mv(streamPhoto);
        let url = '';
        if (!isDev) {
          let photoUrl = await cloudinaryUpload(streamPhoto, `products/`, {});
          fs.unlinkSync(streamPhoto);
          url = photoUrl.secure_url;
        } else {
          url = process.env.LOCALBACKEND + streamPhoto.split(path)[1];
        }
        files.push({ url });
      }
    } else {
      const streamPhoto = `${path}support/` + ticketFiles.name;
      await ticketFiles.mv(streamPhoto);
      let url = '';
      if (!isDev) {
        let photoUrl = await cloudinaryUpload(streamPhoto, `products/`, {});
        fs.unlinkSync(streamPhoto);
        url = photoUrl.secure_url;
      } else {
        url = process.env.LOCALBACKEND + streamPhoto.split(path)[1];
      }
      gallery.push({ url });
    }
    req.body.support.files = [...req.body.support.files, ...files];
    return next();
  } catch (error) {
    return errorHandler(error, req, res, next);
  }
};
