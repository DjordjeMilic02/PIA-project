import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    sex: {
        type: String,
    },
    address: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    email: {
        type: String,
    },
    profile_photo: {
        type: String
    },
    credit_card_number: {
        type: String,
    },
    role: {
        type: String,
    },
    approved: {
        type: Boolean,
    },
    rejected: {
        type: Boolean,
    }
});

export default mongoose.model('User', User, 'korisnici');