import { successResponse, errorHandler } from '../middlewares/responseHandlers';
import Request from 'request-promise';
import notify from '../utils/notify';
const {
  comparePassword,
  encryptPassword,
  generatePassword,
  getJWT,
} = require('../utils/accouunts');

class Admin {
  constructor() {}
  async inviteAgentUpdate(req, res, next) {
    try {
      const { body, models, params } = req;
      let invite = await models.Invitations.findOne({ _id: params.id });
      if (!invite) {
        throw Error('This Invite does not exist');
      }
      await models.Invitations.update({ _id: params.id }, { $set: body });
      if (body.resend) {
        new notify().sendEmail(body.email, 'Invite to work at Farmlord', {
          template: 'admin_invite_email',
          username: body.firstName,
          url: `${process.env.FRONTEND}invitations?token=${invite.token}`,
        });
      }
      return successResponse(res, 'Invite updated successfully', 200, {});
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  async inviteAgentDelete(req, res, next) {
    try {
      const { models, body } = req;
      for (let invite of body.invites) {
        await models.Invitations.remove({ _id: invite });
      }
      return successResponse(res, 'Invites removed successfully', 200, {});
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  async adminUpdate(req, res, next) {
    try {
      const { body, models } = req;
      const { accounts, action } = body;
      for (let acct of accounts) {
        switch (action) {
          case 'suspend':
            await models.Accounts.update(
              { _id: acct },
              {
                $set: {
                  suspended: true,
                },
              }
            );
            break;
          case 'activate':
            await models.Accounts.update(
              { _id: acct },
              {
                $set: {
                  suspended: false,
                },
              }
            );
            break;
          case 'delete':
            let { info } = await models.Accounts.findOne({ _id: acct });
            await models.Accounts.remove({ _id: acct });
            await models.Admins.remove({ _id: info });
            break;
          default:
            break;
        }
      }
      return successResponse(res, 'Accounts updated successfully', 200, {});
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }
  // invite agent method
  async inviteAgent(req, res, next) {
    try {
      const { body, models } = req;
      let invite = await models.Invitations.findOne({ email: body.email });
      if (invite) {
        new notify().sendEmail(invite.email, 'Invite to work at Farmlord', {
          template: 'invite_email',
          username: invite.firstName,
          url: `${process.env.FRONTEND}invitations?token=${invite.token}`,
        });
        throw Error(
          'This email address has a pending invitation, a reminder has been sent to them by email'
        );
      }
      invite = new models.Invitations({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        token: generatePassword(50),
      });
      await invite.save();
      new notify().sendEmail(invite.email, 'Invite to work at Farmlord', {
        template: 'admin_invite_email',
        username: invite.firstName,
        url: `${process.env.FRONTEND}invitations?token=${invite.token}`,
      });
      return successResponse(res, 'Invite sent successfully', 201, {});
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch all admins
  async adminsRetrieveMethod(req, res, next) {
    try {
      const { body, models } = req;
      let admins = await models.Accounts.find({ role: 'ADMIN' }).lean();
      for (let admin of admins) {
        admin.info = await models.Admins.findById(admin.info)
          .select('-createdAt -updatedAt')
          .lean();
      }

      return successResponse(res, 'Admins retrieved successfully', 200, admins);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // fetch all pending invites
  async invitesMethod(req, res, next) {
    try {
      const { body, models } = req;
      let invites = await models.Invitations.find({});
      return successResponse(
        res,
        'Invites retrieved successfully',
        200,
        invites
      );
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }
  // confirm invite method
  async confirmInviteToken(req, res, next) {
    try {
      const { body, models } = req;
      let invite = await models.Invitations.findOne({
        token: body.inviteToken,
      });
      if (!invite) {
        throw Error(
          'There is no pending invitation with this token. Click the link in the email or get the admin to resend the invite'
        );
      }

      return successResponse(res, 'Invite retrieved', 200, invite);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }
  // complete invite process
  async completeInviteToken(req, res, next) {
    try {
      const { body, models } = req;
      let invite = await models.Invitations.findOne({ token: body.token });
      if (!invite) {
        throw Error(
          'There is no pending invitation with this token. Click the link in the email or get the admin to resend the invite'
        );
      }
      let acct = await models.Accounts.findOne({ email: body.email });
      if (acct) {
        throw Error('Another account exists with this email address');
      }
      var hash = await encryptPassword(body.password);
      var admin = new models.Admins({
        firstName: body.firstName,
        lastName: body.lastName,
      });
      var account = new models.Accounts({
        info: admin._id,
        email: body.email,
        password: hash,
        verified: true,
        role: 'ADMIN',
      });
      await Promise.all([account.save(), admin.save(), invite.remove()]);
      return successResponse(
        res,
        'Admin account created successfully',
        201,
        {}
      );
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // create investment opportunity
  async createInvestmentMethod(req, res, next) {
    try {
      const {
        body,
        models: { Investments },
      } = req;
      var inv, msg;
      var { investment } = body;
      if (investment._id) {
        inv = await Investments.findById(investment._id);
        inv.description = investment.description;
        inv.headline = investment.headline;
        msg = 'Investment updated successfully';
      } else {
        investment.completed = ['initiated'];
        inv = new Investments(investment);
        msg = 'Investment created successfully';
      }
      await inv.save();
      return successResponse(res, msg, 201, inv);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // add farm detail to investment opp
  async addFarmToInvestmentMethod(req, res, next) {
    try {
      const {
        body,
        models: { Investments },
      } = req;
      var { farm, investment } = body;
      farm = JSON.parse(JSON.stringify(farm));
      console.log(farm);
      var inv = await Investments.findById(investment);
      if (!inv) {
        throw Error('Couldnt find this investment');
      }
      farm.position = {
        type: 'Point',
        coordinates: farm.coordinates || [],
      };
      inv.farm.photos = farm.photos;
      inv.farm.product.photos = farm.product.photos;
      inv.farm.name = farm.name;
      inv.farm.address = farm.address;
      inv.farm.position = farm.position;
      inv.farm.product.name = farm.product.name;
      inv.farm.product.category = farm.product.category;
      if (!inv.completed.includes('Farm')) {
        inv.completed.push('Farm');
      }
      await inv.save();
      return successResponse(res, 'Farm detail added successfully', 200, inv);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // add farmer detail to investment opp
  async addFarmerToInvestmentMethod(req, res, next) {
    try {
      const {
        body,
        models: { Investments },
      } = req;
      var { farmer, investment } = body;
      var inv = await Investments.findById(investment);
      if (!inv) {
        throw Error('Couldnt find this investment');
      }
      farmer.position = {
        type: 'Point',
        coordinates: farmer.coordinates,
      };
      inv.farmer = farmer;
      if (!inv.completed.includes('Farmer')) {
        inv.completed.push('Farmer');
      }
      await inv.save();
      return successResponse(res, 'Farmer detail added successfully', 200, inv);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // add offering detail to investment opp
  async addOfferingToInvestmentMethod(req, res, next) {
    try {
      const {
        body,
        models: { Investments },
      } = req;
      var { offering, investment } = body;
      var inv = await Investments.findById(investment);
      if (!inv) {
        throw Error('Couldnt find this investment');
      }
      inv.offering = offering;
      if (!inv.completed.includes('Offering')) {
        inv.completed.push('Offering');
      }
      await inv.save();
      return successResponse(
        res,
        'Offering detail added successfully',
        200,
        inv
      );
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // activate/deactivate investment opp
  async activateDeactivateMethod(req, res, next) {
    try {
      const {
        body,
        params,
        models: { Investments },
      } = req;
      var { status, investment } = params;
      var inv = await Investments.findById(investment);
      if (!inv) {
        throw Error('Couldnt find this investment');
      }
      if (inv.completed.length < 4) {
        throw Error(
          'This investment has not been completed. This action is denied'
        );
      }
      inv.status = status;
      await inv.save();
      let msg =
        status == 'active'
          ? 'Investment Activated sucessfully'
          : 'Investment Deactivated successfully';
      return successResponse(res, msg, 200, inv);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

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
      switch (params.status) {
        case 'pending':
          totalAvailable = await Investments.countDocuments({
            status: params.status,
          });
          inv = await Investments.find({ status: 'pending' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Pending investments fetched';
          break;
        case 'active':
          totalAvailable = await Investments.countDocuments({
            status: params.status,
          });
          inv = await Investments.find({ status: 'active' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Active investments fetched';
          break;
        case 'inactive':
          totalAvailable = await Investments.countDocuments({
            status: params.status,
          });
          inv = await Investments.find({ status: 'inactive' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Inactive investments fetched';
          break;
        case 'sold':
          totalAvailable = await Investments.countDocuments({
            status: params.status,
          });
          inv = await Investments.find({ status: 'sold out' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Sold out investments fetched';
          break;
        default:
          break;
      }
      return successResponse(res, msg, 200, {
        investments: inv,
        totalAvailable,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // create farm produce
  async createProduceMethod(req, res, next) {
    try {
      const {
        body,
        models: { Produce },
      } = req;
      var inv, msg;
      var { produce } = body;
      if (produce._id) {
        inv = await Produce.findById(produce._id);
        delete produce._id;
        await Produce.findByIdAndUpdate(inv._id, { $set: produce });
        msg = 'Produce updated successfully';
      } else {
        inv = new Produce(produce);
        msg = 'Produce created successfully';
        await inv.save();
      }
      return successResponse(res, msg, 201, inv);
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

  // activate/deactivate investment opp
  async activateDeactivateProductMethod(req, res, next) {
    try {
      const {
        body,
        params,
        models: { Produce },
      } = req;
      var { status, produce } = params;
      var inv = await Produce.findById(produce);
      if (!inv) {
        throw Error('Couldnt find this produce');
      }
      inv.status = status;
      await inv.save();
      let msg =
        status == 'active'
          ? 'Prodcue Activated sucessfully'
          : 'Prodcue Deactivated successfully';
      return successResponse(res, msg, 200, inv);
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
      switch (params.status) {
        case 'pending':
          totalAvailable = await Produce.countDocuments({
            status: params.status,
          });
          inv = await Produce.find({ status: 'pending' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Pending products fetched';
          break;
        case 'active':
          totalAvailable = await Produce.countDocuments({
            status: params.status,
          });
          inv = await Produce.find({ status: 'active' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Active products fetched';
          break;
        case 'inactive':
          totalAvailable = await Produce.countDocuments({
            status: params.status,
          });
          inv = await Produce.find({ status: 'inactive' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Inactive products fetched';
          break;
        case 'sold':
          totalAvailable = await Produce.countDocuments({
            status: params.status,
          });
          inv = await Produce.find({ status: 'sold out' })
            .limit(limit)
            .skip(limit * (Number(params.page) - 1));
          msg = 'Sold out products fetched';
          break;
        default:
          break;
      }
      return successResponse(res, msg, 200, {
        products: inv,
        totalAvailable,
      });
    } catch (error) {
      return errorHandler(error, req, res, next);
    }
  }

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

  // start or close a support ticket
  async startOrCloseTicket(req, res, next) {
    try {
      const {
        params,
        models: { Support },
      } = req;
      var { ticket, status } = params;
      let {
        info: { _id },
        role,
      } = req.user;
      let supportTicket = await Support.findById(ticket);
      if (!supportTicket) {
        throw 'No support ticket found with this ID';
      }
      supportTicket.status = status;
      if (status == 'active') {
        supportTicket.assigned = _id;
      }
      await supportTicket.save();
      return successResponse(
        res,
        'Ticket status has been updated',
        201,
        supportTicket
      );
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

module.exports = new Admin();
