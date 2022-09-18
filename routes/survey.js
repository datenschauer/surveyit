'use strict';

const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController")

router.get("/:survey", (req, res) => {
    const surveyName = req.params.survey;
    res.redirect(`/${surveyName}/start`);
});

router.get("/:survey/start", surveyController.getSurveyStart)

router.get("/:survey/:page", surveyController.getSurveyPage)

module.exports = router;