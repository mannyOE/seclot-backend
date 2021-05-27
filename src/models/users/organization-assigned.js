import mongoose from 'mongoose';

const iceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'IceGroups',
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
module.exports = mongoose.model('UserIces', iceSchema);
