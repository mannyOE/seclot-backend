import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    //   longitude, latitude
    type: [Number],
    required: true,
  },
});

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    seclotId: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    lastKnownLocation: {
      type: pointSchema,
    },
    firebaseToken: {
      type: String,
    },
    lastKnownLocationUpdate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orgnaizations',
    },
    pin: {
      type: String,
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
module.exports = mongoose.model('Users', userSchema);
