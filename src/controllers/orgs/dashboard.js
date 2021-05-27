import {
  errorHandler,
  successResponse,
} from '../../middlewares/responseHandlers';
class Dashboard {
  constructor() {}

  async fetchDashboardData({ models, user, params }, res, next) {
    try {
      var data = {
        totalCheckIns: 0,
        totalVisits: 0,
        totalBookings: 0,
        numberOfActiveSubscribers: 0,
        averageSubscribers: 0,
        invoices: [],
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        numberOfSales: 0,
        incomeChartData: [],
        profitChart: [],
      };
      let allMonths = [
          'Jan.',
          'Feb.',
          'Mar.',
          'Apr.',
          'May',
          'Jun.',
          'Jul.',
          'Aug.',
          'Sept.',
          'Oct.',
          'Nov.',
          'Dec.',
        ],
        monthsData = [],
        daysData = [];
      let currMonth = new Date().getMonth();
      if (params.period == '1m') {
        for (let index = 31; index >= 0; index--) {
          let dg = new Date(),
            bw = dg.setDate(dg.getDate() - index);
          bw = new Date(bw);
          data.incomeChartData.push({
            day: `${bw.getFullYear()}-${bw.getMonth()}-${bw.getDate()}`,
            expenses: 0,
            revenue: 0,
          });
        }
      } else {
        let total = params.period == '6m' ? 7 : 13;
        for (let index = 1; index < total; index++) {
          let dg = new Date(),
            bw = dg.setMonth(dg.getMonth() - index);
          bw = new Date(bw);
          data.incomeChartData.push({
            day: `${bw.getFullYear()}-${bw.getMonth()}`,
            expenses: 0,
            revenue: 0,
          });
        }
      }
      for (let index = currMonth; index >= 0; index--) {
        let dg = new Date(),
          bw = dg.setMonth(dg.getMonth() - index);
        bw = new Date(bw);
        data.profitChart.push({
          label: allMonths[bw.getMonth()] + ' ' + bw.getFullYear(),
          value: 0,
        });
      }
      let diff = new Date().getTime() - new Date(user.createdAt).getTime();
      let month = 1000 * 60 * 60 * 24 * 7 * 4,
        months = Math.ceil(diff / month);
      var facilities = await models.Facilities.find({
        partner: user.info,
      }).lean();
      data.invoices = await models.Invoices.find({
        partner: user.info,
      }).limit(10);
      for (let facility of facilities) {
        data.totalCheckIns =
          data.totalCheckIns +
          (await models.Checkins.countDocuments({
            facility: facility._id,
          }));
        data.totalVisits =
          data.totalVisits +
          (await models.Visits.countDocuments({
            facility: facility._id,
          }));

        data.totalBookings =
          data.totalBookings +
          (await models.Bookings.countDocuments({
            facility: facility._id,
          }));
        data.averageSubscribers = data.totalBookings / months;
        data.numberOfActiveSubscribers =
          data.numberOfActiveSubscribers +
          (await models.Checkins.countDocuments({
            facility: facility._id,
            createdAt: { $gte: new Date() },
          }));

        var payments = await models.Payments.find({
          facility: facility._id,
        }).lean();
        data.numberOfSales = data.numberOfSales + payments.length;
        for (let pay of payments) {
          let mont = new Date(pay.createdAt).getMonth(),
            dateString = new Date(pay.createdAt).toDateString();
          data.totalPayments = data.totalPayments + pay.totalAmount;
          data.totalExpenses = data.totalExpenses + pay.urbanspaceShare;
          data.totalRevenue = data.totalRevenue + pay.facilityShare;
          data.profitChart[mont].value =
            data.profitChart[mont].value + pay.facilityShare;
          let index = data.incomeChartData.findIndex(e => {
            if (params.period === '1m') {
              return new Date(e.day).toDateString() === dateString;
            } else {
              return new Date(e.day).getMonth() === mont;
            }
          });
          if (index !== -1) {
            data.incomeChartData[index].expenses =
              data.incomeChartData[index].expenses + pay.urbanspaceShare;
            data.incomeChartData[index].revenue =
              data.incomeChartData[index].revenue + pay.facilityShare;
          }
        }
      }
      successResponse(res, 'data retrieved', '00', data);
    } catch (error) {
      errorHandler(error, '02', res, next);
    }
  }
}

module.exports = new Dashboard();
