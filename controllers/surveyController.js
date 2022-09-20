const { startSurvey } = require("./surveyStarter");
const Survey = require("../models/survey");
const surveys = require("../util/surveys");
const { v4: uuidv4 } = require("uuid");

exports.getSurveyStart = (req, res, next) => {
    const surveyName = req.params.survey;
    console.log(req.session);
    Survey.findOne({name: surveyName}).then((survey) => {
        if (survey) {
            return res.render(`${surveyName}/start`, {
                path: `/${surveyName}/start`,
                survey: surveyName,
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
                    survey: surveyName,
                });
            } else {
            console.log("No Survey found or can be started");
            next();}
        }
    }).catch(err => console.log(err))
}

exports.postSurveyStart = (req, res) => {
    req.session.started = Date.now();
    let uuid;
    if (req.session.uuid) {
        uuid = req.session.uuid;
    } else {
        uuid = uuidv4();
        req.session.uuid = uuid;
    }
    res.redirect(`/${req.params.survey}/${uuid}`);
}

exports.getCurrentSurvey = (req, res) => {
    console.log(req.session);
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
    const finished = Date.now();
    Survey.findOne({name: req.body.survey_name}).then((survey) => {
        const entry = {};
        entry.started = req.session.started;
        entry.finished = finished;
        entry.uuid = req.body.uuid;
        const ip_split = req.socket.remoteAddress.split(":");
        entry.ip = ip_split[ip_split.length - 1];

        entry.themes = getThemes(req.body);
        entry.oldThemes = getOldThemes(req.body);
        entry.demographics = getDemographics(req.body);

        survey.answers.push(entry);

        survey.save().then(res.redirect("/thank_you"));
    }).catch(err => {console.log(err)})
}

function getThemes(object) {
    const themes = {};
    let currentThemeNumber = 0;
    for ([key, val] of Object.entries(object)) {
        if (key.startsWith("theme_")) {
            const split = key.split("_");
            if (split[1] > currentThemeNumber) {
                currentThemeNumber = split[1];
                themes[currentThemeNumber] = {};
                themes[currentThemeNumber].name = val;
            } else if (split[1] === currentThemeNumber) {
                themes[currentThemeNumber][split[2]] = true;
            }
        }
    }
    return themes;
}

function getOldThemes(object) {
    const oldThemes = {};
    for ([key, val] of Object.entries(object)) {
        if (key.startsWith("altes_theme")) {
            oldThemes[key.split("_")[2]] = val;
        }
    }
    return oldThemes;
}

function getDemographics(object) {
    const demographics = {};
    const exclusion = ["_csrf", "uuid", "survey_name"];
    let tenure = null;
    for ([key, val] of Object.entries(object)) {
        if (
            !key.startsWith("theme") &&
            !key.startsWith("altes") &&
            !exclusion.includes(key)
        ) {
            if (key === "Lehrkraft") {
                tenure = val;
            }
            if (["staatlich", "kirchlich"].includes(key)) {
                tenure === key ? demographics[key] = val : demographics[key] = "na";
            } else {
                demographics[key] = val;
            }
        }
    }
    return demographics;
}