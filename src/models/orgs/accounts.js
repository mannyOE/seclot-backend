const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  beneficiary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
});
// Declare the Schema of the Mongo model
const orgSchema = new mongoose.Schema(
  {
    seclotId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    firebaseToken: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    accountConfirmed: {
      default: false,
      type: Boolean,
    },
    authToken: {
      type: String,
    },
    confirmationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    beneficiaries: {
      type: [beneficiarySchema],
      default: [],
    },
    system: {
      type: String,
      enum: ['live', 'test', 'dev', 'closed'],
      default: 'dev',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

//Export the model
module.exports = mongoose.model('Orgnaizations', orgSchema);
