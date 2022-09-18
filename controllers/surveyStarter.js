const { timeIntervals } = require("../util/constants")

const Survey = require("../models/survey")

exports.startSurvey = (surveyName, startDate, endDate) => {
        const newSurvey = new Survey ({
            name: surveyName,
            start: startDate,
            end: endDate,
            pages: [],
            answers: [],
        })
    return newSurvey.save();
}