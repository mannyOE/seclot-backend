import {
  errorHandler,
  successResponse,
} from '../../middlewares/responseHandlers';
import { generateID } from '../../utils/accouunts';
class Invoices {
  constructor() {}

  async createInvoice({ models, user, body }, res, next) {
    try {
      var invoices = await models.Invoices.find({
        partner: user.info,
      });
      var revenue = 0,
        withdrawals = 0;
      var facilities = await models.Facilities.find({
        partner: user.info,
      })
        .select('_id')
        .lean();
      for (let facility of facilities) {
        var payments = await models.Payments.find({
          facility: facility._id,
        })
          .select('facilityShare')
          .lean();
        for (let pay of payments) {
          revenue = revenue + pay.facilityShare;
        }
      }
      for (let inv of invoices) {
        withdrawals = withdrawals + inv.amount;
      }
      var balance = revenue - withdrawals;
      if (Number(body.invoice.amount) > balance) {
        throw Error('You do not have sufficient balance to send this invoice');
      }
      var invoice = new models.Invoices({
        partner: user.info,
        amount: body.invoice.amount,
        due_date: body.invoice.due_date,
        status: 'unpaid',
        invoiceId: generateID(8),
      });
      await invoice.save();
      successResponse(res, 'invoice created', '00', {});
    } catch (error) {
      errorHandler(error, '02', res, next);
    }
  }

  async fetchInvoicesData({ models, user, params }, res, next) {
    try {
      var data = {
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        withdrawals: 0,
        invoices: [],
      };
      let limit = 10,
        start = (Number(params.page) - 1) * limit,
        stop = Number(params.page) * limit;

      var invoices = await models.Invoices.find({
        partner: user.info,
      });
      data.invoices = invoices.slice(start, stop);
      data.totalPages = invoices.length;
      for (let inv of invoices) {
        if (inv.status === 'paid') {
          data.withdrawals = data.withdrawals + inv.amount;
        }
      }

      var facilities = await models.Facilities.find({
        partner: user.info,
      }).lean();
      for (let facility of facilities) {
        var payments = await models.Payments.find({
          facility: facility._id,
        }).lean();
        for (let pay of payments) {
          data.totalPayments = data.totalPayments + pay.totalAmount;
          data.totalExpenses = data.totalExpenses + pay.urbanspaceShare;
          data.totalRevenue = data.totalRevenue + pay.facilityShare;
        }
      }
      successResponse(res, 'data retrieved', '00', data);
    } catch (error) {
      errorHandler(error, '02', res, next);
    }
  }
}

module.exports = new Invoices();
