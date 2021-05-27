import mongoose, { Schema, model } from 'mongoose';
const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);
module.exports = model(
  'Settings',
  Schema(
    {
      lastId: {
        type: String,
      },
      subscriptions: {
        type: [subscriptionSchema],
        default: [],
      },
      referalPercentage: {
        type: Number,
        default: 5,
      },
      paystackTestPublicKey: {
        type: String,
      },
      paystackTestPrivateKey: {
        type: String,
      },
      paystackLivePublicKey: {
        type: String,
      },
      paystackLivePrivateKey: {
        type: String,
      },

      twillioPhoneNumber: {
        type: String,
      },
      twillioSID: {
        type: String,
      },
      twillioToken: {
        type: String,
      },
      firebaseServerToken: {
        type: String,
      },
      firebaseApiKey: {
        type: String,
      },
      systemStatus: {
        type: String,
        enum: ['live', 'test', 'dev', 'closed'],
        default: 'dev',
      },
    },
    { timestamps: true, versionKey: false }
  )
);
