import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Company = new Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    services: {
        type: [String],
    },
    prices: {
        type: [Number],
    },
    contact_number: {
        type: String,
    },
    vacation_start: {
        type: Date,
    },
    vacation_end: {
        type: Date,
    },
    decorators: {
        type: Array,
    }
});

export default mongoose.model('Company', Company, 'firme');