'use strict';

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const surveySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    start: Date,
    end: Date,
    pages: [{
        shortHand: String,
        previous: String,
        next: String,
    }],
    answers: [{
        date: Date,
        entries: {
            page: String,
        }
    }]
})

module.exports = mongoose.model("Survey", surveySchema);