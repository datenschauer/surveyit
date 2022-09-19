const { startSurvey } = require("./surveyStarter");
const Survey = require("../models/survey");
const surveys = require("../util/surveys");
const { v4: uuidv4 } = require("uuid");

exports.getSurveyStart = (req, res, next) => {
    const surveyName = req.params.survey;
    Survey.findOne({name: surveyName}).then((survey) => {
        if (survey) {
            return res.render(`${surveyName}/start`, {
                path: `/${surveyName}/start`,
            })
        } else {
            const surveyFound = surveys.filter(({name}) => {
                return name === surveyName
            });
            if (surveyFound.length >= 1) {
                startSurvey(
                    surveyFound[0].name,
                    surveyFound[0].start,
                    surveyFound[0].end,
                )
                return res.render(`${surveyName}/start`, {
                    path: `/${surveyName}/start`,
                });
            } else {
            console.log("No Survey found or can be started");
            next();}
        }
    }).catch(err => console.log(err))
}

exports.postSurveyStart = (req, res) => {
    const uuid = uuidv4();
    res.redirect(`/${req.params.survey}/${uuid}`);
}

exports.getCurrentSurvey = (req, res) => {
    const survey = surveys.filter(({ name }) => name === req.params.survey)[0]
    const answer = {
        uuid: req.params.uuid,
        started: Date.now(),
        ip: req.socket.remoteAddress,
        entries: [],
    }
    res.render(`${survey.name}/survey.ejs`, {
        path: `${survey.name}/${answer.uuid}`,
        survey: survey,
        answer: answer,
    })
}

exports.postSaveCurrentSurvey = (req, res) => {

}

exports.getThankYouPage = (req, res) => {

}