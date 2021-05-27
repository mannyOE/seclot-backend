import { successResponse, errorHandler } from '../middlewares/responseHandlers';
import Request from 'request-promise';
import notify from '../utils/notify';
const {
  comparePassword,
  encryptPassword,
  generatePassword,
  getJWT,
} = require('../utils/accouunts');

class Market {
  constructor() {}

  // fetch investments list
  async fetchListOfInvestments(req, res, next) {
    try {
      const {
        params,
        models: { Investments },
      } = req;
      var inv,
        msg,
        limit = 20,
        totalAvailable = 0;
      totalAvailable = await Investments.countDocuments({
        status: 'active',
      });
      inv = await Investments.find({ status: 'active' })
        .limit(limit)
        .skip(limit * (Number(params.page) - 1));
      msg = 'Active investments fetched';
      return successResponse(res, msg, 200, {
        investments: inv,
        totalAvailable,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch single investment
  async fetchAnInvestment(req, res, next) {
    try {
      const {
        params,
        models: { Investments },
      } = req;
      var inv;
      inv = await Investments.findById(params.investment)
        .populate({
          path: 'reviews.user',
          select: 'firstName lastName avatar',
        })
        .lean();
      let cat = inv.farm.product.category;
      let related = await Investments.find({
        _id: { $ne: inv._id },
        'farm.product.category': cat,
        status: 'active',
      });
      let msg = 'Investment retrieved';
      return successResponse(res, msg, 200, {
        investment: inv,
        related,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // add review to investment
  async addReviewToInvestment(req, res, next) {
    try {
      const {
        params,
        body: { review },
        models: { Investments },
      } = req;
      var inv;
      inv = await Investments.findById(params.investment);
      review.user = req.user.info._id;
      inv.reviews.push(review);
      await inv.save();
      console.log(inv);
      let msg = 'Review Added. Thank you...';
      return successResponse(res, msg, 200, {
        investment: inv,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch produce list
  async fetchListOfProducts(req, res, next) {
    try {
      const {
        params,
        models: { Produce },
      } = req;
      var inv,
        msg,
        limit = 20,
        totalAvailable = 0;
      totalAvailable = await Produce.countDocuments({
        status: 'active',
      });
      inv = await Produce.find({ status: 'active' })
        .limit(limit)
        .skip(limit * (Number(params.page) - 1));
      msg = 'Active products fetched';
      return successResponse(res, msg, 200, {
        products: inv,
        totalAvailable,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch single product list
  async fetchAProduct(req, res, next) {
    try {
      const {
        params,
        models: { Produce, Users },
      } = req;
      var inv;
      inv = await Produce.findById(params.produce).lean();
      //  for (let rev of inv.reviews) {
      //    rev.user = Users.findById(rev.user).select('firstName lastName avatar');
      //  }

      let cat = inv.category;
      let related = await Produce.find({
        _id: { $ne: inv._id },
        category: cat,
        status: 'active',
      });
      let msg = 'Produce retrieved';
      return successResponse(res, msg, 200, {
        product: inv,
        related,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // add review list
  async addReviewToProduct(req, res, next) {
    try {
      const {
        params,
        body: { review },
        models: { Produce },
      } = req;
      var inv;
      inv = await Produce.findById(params.produce);
      review.user = req.user.info._id;
      inv.reviews.push(review);
      await inv.save();
      console.log(inv);
      let msg = 'Review Added. Thank you...';
      return successResponse(res, msg, 200, {
        product: inv,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }
}

module.exports = new Market();
