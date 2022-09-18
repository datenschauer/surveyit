"use strict";
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash"); // for flashing messages to seesions by redirect (e.g. errors to the user)
const { timeIntervals } = require("./util/constants");

// INSTANTIATE express app
const app = express();

const MONGODB_URI = process.env.MONGODB_URI;

const sessionStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
});
sessionStore.on("error", (err) => {
    console.log(err);
});

// SETUP CSRF Protection
const csrfProtection = csrf();

// SETUP routes
const indexRoutes = require("./routes/survey");
const path = require("path");

// SETUP views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SETUP middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: timeIntervals.WEEK * 2 },
        store: sessionStore,
    })
);
app.use(csrfProtection);
app.use(flash());

// SET session variables to localStorage which should be used in EVERY page
const setLocalVariables = (req, res, next) => {
    res.locals.session = req.session;
    res.locals.csrfToken = req.csrfToken();
    next();
};
app.use(setLocalVariables);

app.use("/", indexRoutes);

const port = 8008;

mongoose
    .connect(MONGODB_URI)
    .then((_) => {
        app.listen(port);
        console.log("Running!");
    }).catch(err => {console.log(err)})
