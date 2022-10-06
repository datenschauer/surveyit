'use strict';

const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController")

router.get("/thank_you", (req, res) => {
    res.render("thank_you", {path: "/thank_you"});
});

router.get("/:survey", (req, res) => {
    const surveyName = req.params.survey;
    res.redirect(`/${surveyName}/start`);
});

router.get("/:survey/download", surveyController.getSurveyDataDownload);

router.post("/:survey/download", surveyController.postSurveyDataDownload);

router.get("/:survey/start", surveyController.getSurveyStart);

router.post("/:survey/start", surveyController.postSurveyStart);

router.get("/:survey/:uuid", surveyController.getCurrentSurvey);

router.post("/:survey/:uuid", surveyController.postSaveCurrentSurvey);

module.exports = router;