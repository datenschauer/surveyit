'use strict';

const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController")

router.get("/:survey", (req, res) => {
    const surveyName = req.params.survey;
    res.redirect(`/${surveyName}/start`);
});

router.get("/:survey/start", surveyController.getSurveyStart);

router.post("/:survey/start", surveyController.postSurveyStart);

router.get("/:survey/:uuid", surveyController.getCurrentSurvey);

router.post("/:survey/:uuid", surveyController.postSaveCurrentSurvey);

router.get("/:survey/thank_you", surveyController.getThankYouPage);

module.exports = router;