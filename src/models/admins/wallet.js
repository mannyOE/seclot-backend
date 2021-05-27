const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const walletSchema = new mongoose.Schema(
  {
    totalIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    system: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

//Export the model
module.exports = mongoose.model('AdminWallet', walletSchema);
