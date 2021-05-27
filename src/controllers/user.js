import { successResponse, errorHandler } from '../middlewares/responseHandlers';
import Request from 'request-promise';
import notify from '../utils/notify';
const {
  comparePassword,
  encryptPassword,
  generatePassword,
  getJWT,
} = require('../utils/accouunts');

class User {
  constructor() {}

  // add comment to support ticket
  async addCommentMethod(req, res, next) {
    try {
      const {
        body,
        params,
        models: { Support },
      } = req;
      var { comment, files } = body;
      var { ticket } = params;
      let {
        info: { _id },
        role,
      } = req.user;
      let supportTicket = await Support.findById(ticket);
      if (!supportTicket) {
        throw 'No support ticket found with this ID';
      }
      supportTicket.comments.push({
        comment,
        user: _id,
        role,
        files,
      });
      await supportTicket.save();
      return successResponse(res, 'Comment has been added', 201, supportTicket);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch support ticket list
  async fetchListOfSupport(req, res, next) {
    try {
      const {
        params,
        models: { Support, Users, Admins },
      } = req;
      var inv,
        msg,
        limit = 20,
        totalAvailable = 0;
      switch (params.status) {
        case 'pending':
          totalAvailable = await Support.countDocuments({
            status: params.status,
          });
          inv = await Support.find({ status: 'pending' })
            .limit(limit)
            .populate({ path: 'user', select: 'avatar firstName lastName' })
            .skip(limit * (Number(params.page) - 1))
            .lean();
          msg = 'Pending support tickets fetched';
          break;
        case 'active':
          totalAvailable = await Support.countDocuments({
            status: params.status,
          });
          inv = await Support.find({ status: 'active' })
            .limit(limit)
            .populate({ path: 'user', select: 'avatar firstName lastName' })
            .skip(limit * (Number(params.page) - 1))
            .lean();
          msg = 'Active support tickets fetched';
          break;
        case 'closed':
          totalAvailable = await Support.countDocuments({
            status: params.status,
          });
          inv = await Support.find({ status: 'closed' })
            .limit(limit)
            .populate({ path: 'user', select: 'avatar firstName lastName' })
            .skip(limit * (Number(params.page) - 1))
            .lean();
          msg = 'Closed support tickets fetched';
          break;
        default:
          break;
      }
      for (let item of inv) {
        if (item.comments) {
          for (let comment of item.comments) {
            let select = 'avatar firstName lastName';
            if (comment.role == 'USER') {
              comment.user = await Users.findById(comment.user).select(select);
            }
            if (comment.role == 'ADMIN' || comment.role == 'SUPER-ADMIN') {
              comment.user = await Admins.findById(comment.user).select(select);
            }
          }
        }
      }
      return successResponse(res, msg, 200, {
        tickets: inv,
        totalAvailable,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch single ticket
  async fetchSingleTicket(req, res, next) {
    try {
      const {
        params,
        models: { Support, Users, Admins },
      } = req;
      var inv = await Support.findById(params.ticket)
        .populate({ path: 'user', select: 'avatar firstName lastName' })
        .lean();
      if (!inv) {
        throw 'No ticket found with this ID';
      }

      if (inv.comments) {
        for (let i = 0; i < inv.comments.length; i++) {
          let comment = inv.comments[i];
          let select = 'avatar firstName lastName';
          if (comment.role == 'USER') {
            inv.comments[i].user = await Users.findById(
              comment.user.toString()
            ).select(select);
          }
          if (comment.role == 'ADMIN' || comment.role == 'SUPER-ADMIN') {
            let sct = await Admins.findById(comment.user.toString());
            inv.comments[i].user = sct;
          }
        }
      }

      return successResponse(res, 'Tickets fetched successfully', 200, inv);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }
}

module.exports = new User();
