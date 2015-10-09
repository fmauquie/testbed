"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var app = express();

app.use('/', express.static(__dirname + '/app'));
app.use('/rest', bodyParser.json());
app.listen(9000);

// Add Rest calls here
// app.get(...)