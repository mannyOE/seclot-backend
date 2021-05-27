import {
  errorHandler,
  successResponse,
} from '../../middlewares/responseHandlers';
import Cue from '../../utils/client';
class Facilities {
  constructor() {}

  async fetchListOfFacilities({ models, user, params }, res, next) {
    try {
      let limit = 10,
        page = Number(params.page || 1) - 1;
      var facilities = await models.Facilities.find({
        status: 'active',
      })
        .skip(limit * page)
        .limit(limit)
        .sort({ popularity: -1 })
        .populate({
          path: 'partner',
        })
        .populate({
          path: 'reviews.user',
        })
        .lean();
      var totalAvailable = await models.Facilities.countDocuments({
        status: 'active',
      });
      successResponse(res, 'Facilities list fetched successfully', '00', {
        facilities,
        totalAvailable,
      });
    } catch (error) {
      errorHandler(error, '02', res, next);
    }
  }

  async addReviewToFacility({ models, user, body, params }, res, next) {
    try {
      let data = {
        comment: body.review.comment,
        rating: body.review.rating,
        user: user.info,
      };
      await models.Facilities.update(
        {
          _id: params.facility,
        },
        { $set: data }
      );
      Cue.create('update popularity review', {
        facility: params.facility,
        review: data,
      }).save();
      var facility = await models.Facilities.findOne({
        _id: params.facility,
      })
        .populate({
          path: 'partner',
        })
        .populate({
          path: 'reviews.user',
        })
        .lean();
      if (!facility) {
        throw Error('Could not locate this facility under your account');
      }
      successResponse(res, 'Facility fetched successfully', '00', facility);
    } catch (error) {
      errorHandler(error, '02', res, next);
    }
  }

  async fetchOneFacility({ models, user, params }, res, next) {
    try {
      var facility = await models.Facilities.findOne({
        partner: user.info,
        _id: params.facility,
      })
        .populate({
          path: 'partner',
        })
        .populate({
          path: 'reviews.user',
        })
        .lean();
      if (!facility) {
        throw Error('Could not locate this facility under your account');
      }
      Cue.create('update popularity views', {
        facility: params.facility,
      }).save();
      successResponse(res, 'Facility fetched successfully', '00', facility);
    } catch (error) {
      errorHandler(error, '02', res, next);
    }
  }
}

module.exports = new Facilities();
