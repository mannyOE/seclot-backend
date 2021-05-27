import { Schema, model } from 'mongoose';

module.exports = model(
  'Admins',
  Schema(
    {
      fullname: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      avatar: {
        type: String,
      },
      email: {
        type: String,
        required: true,
      },
      fcmToken: {
        type: String,
      },
      password: {
        type: String,
        required: true,
      },
    },
    { timestamps: true, versionKey: false }
  )
);
