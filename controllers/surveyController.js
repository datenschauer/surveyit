const { startSurvey } = require("./surveyStarter");
const Survey = require("../models/survey");
const surveys = require("../util/surveys");

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
                console.log(surveyFound);
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

}

exports.getSurveyPage = (req, res) => {
    const { survey, page } = req.params;
    console.log(survey, page);
    res.render(`${survey}/${page}`, {
        path: `/${survey}/${page}`,
    })
}