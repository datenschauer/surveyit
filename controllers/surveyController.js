const { startSurvey } = require("./surveyStarter");
const Survey = require("../models/survey");
const surveys = require("../util/surveys");
const { v4: uuidv4 } = require("uuid");
const {handleError} = require("./errorController");

exports.getSurveyStart = (req, res, next) => {
    const surveyName = req.params.survey;
    Survey.findOne({name: surveyName}).then((survey) => {
        if (survey) {
            const cur_time = Date.now();
            if (cur_time > survey.start && cur_time < survey.end) {
                return res.render(`${surveyName}/start`, {
                    path: `/${surveyName}/start`,
                    survey: surveyName,
                    })
            } else {
                return (cur_time < survey.start) ? res.render("surveynotstarted", {surveyName: surveyName})
                    : res.render("surveyended", {surveyName: surveyName});
            }
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
                res.render("nosurveyfound", {surveyName: surveyName});
            }
        }
    }).catch(err => handleError(err, next));
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

exports.getCurrentSurvey = (req, res, next) => {
    Survey.findOne({name: req.params.survey}).then(survey => {
    const givenAnswers = survey.answers;
    const currentUserAlreadyAnswered = givenAnswers.filter(({uuid}) => uuid === req.session.uuid);
    if (currentUserAlreadyAnswered.length >= 1) {
        return res.render("alreadyanswered");
    } else {
        //const survey = surveys.filter(({name}) => name === req.)[0]
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
    }}).catch(err => handleError(err, next));
}

exports.postSaveCurrentSurvey = (req, res, next) => {
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
    }).catch(err => {handleError(err, next)})
}

exports.getSurveyDataDownload = (req, res) => {
    res.render(`${req.params.survey}/download`, {
        path: `/${req.params.survey}/download`,
        error: req.flash("error")[0],
        survey: req.params.survey,
    })
}

exports.postSurveyDataDownload = (req, res) => {
    const surveyName = req.params.survey;
    const password = req.body.password;
    if (password === process.env.DOWNLOAD_PASS) {
        Survey.findOne({name: surveyName}).then(surveyData => {
            const bufferFile = createCSV(surveyData);
            const currentDate = new Date();
            const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`
            const fileName = `${surveyName}_vom_${dateString}.csv`;
            res.set({
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=${fileName}`
            });
            res.send(bufferFile);
        }).catch(err => console.log(err));
    } else {
        req.flash("error", true);
        res.render(`${surveyName}/download`, {
            path: `/${surveyName}/download`,
            error: req.flash("error")[0],
            survey: surveyName,
        })
    }
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

function createCSV(data) {
    const dateOptions = {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZone: 'Europe/Berlin'
    }
    let csv = "";
    const header = "thema; th_interessant; th_wichtig; th_laeuft; th_sonstiges; th_neu; th_alt; dem_fach; " +
        "dem_schulart; dem_lehrkraft; dem_staatlich; dem_kirchlich; dem_praxis; dem_geschlecht; id; start; ende;\n"

    csv += header;
    const answers = data.answers;

    for (let answer of answers) {
        // create demographics fields, which should be attached to every theme
        const dem = answer.demographics;
        let demFields = `${dem.Fach};`;
        demFields += `${dem.Schulart};`;
        demFields += `${dem.Lehrkraft};`;
        demFields += `${dem.staatlich};`;
        demFields += `${dem.kirchlich};`;
        demFields += `${dem.unterrichtspraxis};`;
        demFields += `${dem.geschlecht};`;
        demFields += `${answer.uuid};`;
        demFields += `${new Intl.DateTimeFormat("de-DE", dateOptions).format(answer.started)};`;
        demFields += `${new Intl.DateTimeFormat("de-DE", dateOptions).format(answer.finished)};\n`;

        // walk through themes:
        for (let theme in answer.themes) {
            let row = `"${answer.themes[theme].name}";`;
            row += `${answer.themes[theme].interessant ? 1 : 0};`;
            row += `${answer.themes[theme].wichtig ? 1 : 0};`;
            row += `${answer.themes[theme].laeuft ? 1 : 0};`;
            row += `${answer.themes[theme].sonstiges ? 1 : 0};`;
            row += `${answer.themes[theme].neu ? 1 : 0};0;${demFields}`;
            csv += row;
        }
        // walk through old themes:
        for (let oldTheme in answer.oldThemes) {
            let row = `"${answer.oldThemes[oldTheme]}";0;0;0;0;0;1;${demFields}`;
            csv += row;
        }
    }

    return Buffer.from(csv);
}