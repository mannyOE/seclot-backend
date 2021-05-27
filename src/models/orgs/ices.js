import mongoose from 'mongoose';

const iceSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: [String],
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Organization',
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
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
module.exports = mongoose.model('IceGroups', iceSchema);
