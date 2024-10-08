import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Zahtevi = new Schema({
    dateTime: {
        type: Date,
      },
      Area: {
        type: Number,
      },
      Type: {
        type: String,
      },
      extra: {
        type: String,
      },
      company: {
        type: String,
      },
      designated: {
        type: String,
      },
      services: {
        type: [String],
      },
      raspored: {
        type: Object,
      },
      callerUsername: {
        type: String,
      },
      dateFinished: {
        type: Date,
      },
      dateActive: {
        type: Date,
      },
      waterSurfaceCount: {
        type: Number
      },
      finished: {
        type: Boolean
      },
      rejected: {
        type: Boolean
      },
      rejectionText: {
        type: String
      },
      odrzavanjeRequested: {
        type: Boolean
      }
});

export default mongoose.model('Zahtevi', Zahtevi, 'zahtevi');