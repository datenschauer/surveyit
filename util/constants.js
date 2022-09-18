'use strict';

const timeIntervals = {};

timeIntervals.MILLISECOND = 1;
timeIntervals.SECOND = timeIntervals.MILLISECOND * 1000;
timeIntervals.MINUTE = timeIntervals.SECOND * 60;
timeIntervals.HOUR = timeIntervals.MINUTE * 60;
timeIntervals.DAY = timeIntervals.HOUR * 24;
timeIntervals.WEEK = timeIntervals.DAY * 7;

exports.timeIntervals = timeIntervals;

exports.PRICE_PER_CUP = 30;

exports.PRICE_FOR_MILK = 10;

exports.TOKEN_EXPIRATION_IN_MINUTES = 30;

exports.BASE_URL = process.env.BASE_URL;
// exports.BASE_URL = 'http://localhost:8000';

exports.FROM_EMAIL = process.env.FROM_EMAIL;

exports.PAYPAL_LINK = process.env.PAYPAL_LINK;

exports.ACCOUNT = {
  accountee: process.env.ACOUNTEE,
  IBAN: process.env.IBAN,
  BIC: process.env.BIC,
}
