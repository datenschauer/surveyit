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
    answers: [],
})

module.exports = mongoose.model("Survey", surveySchema);