'use strict';

exports.get404 = (req, res, next) => {
    res.status(404).render("page404", { session: req.session });
};

exports.get500 = (req, res, next) => {
    return res.status(500).render("page500", { session: req.session });
}

exports.handleError = function(err, next, status=500) {
    const error = new Error(err);
    error.httpStatusCode = status;
    return next(error);
}
