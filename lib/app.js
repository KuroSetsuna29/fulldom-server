/*

Copyright 2016 AJ Jordan <alex@strugee.net>.

This file is part of fulldom-server.

fulldom-server is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

fulldom-server is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with fulldom-server. If not, see
<https://www.gnu.org/licenses/>.

*/

var fs = require('fs');
var path = require('path');
var express = require('express');
var compression= require('compression');
var phantomjs = require('phantomjs-prebuilt');

var app = express();
var APIKEY = process.env.APIKEY || "038623df-6e2d-49e1-a5b4-70373ac04c82";

app.set('query parser', 'simple');
app.use(compression());

function handleRequest(req, res, url) {
	if (req.query.apikey != APIKEY) {
		res.statusCode = 400;
		res.end('"apikey" is invalid.');
		return;
	}

	var args = {
		url: url,
		selector: req.query.selector,
		useragent: req.query.useragent,
		wait: req.query.wait,
	};

	var program = phantomjs.exec(path.join(__dirname, '../lib/phantomjs.js'), JSON.stringify(args));
	var buffers = [];
	program.stdout.on('data', function (c) { buffers.push(c) });
	program.stderr.pipe(process.stderr);
	program.on('exit', function() {
		let output = Buffer.concat(buffers).toString('utf8');
		output = output.replace(/^.*?(<!DOCTYPE html>|<html>)/si, '$1');
		res.send(output);
		res.end();
	});
}

app.get('/', function(req, res, next) {
	if (!req.query.url) {
		res.statusCode = 400;
		res.end('URL not provided. Either use a "url" query string parameter or use it as the first URL path component.');
		return;
	}

	handleRequest(req, res, req.query.url);
});

app.get('/:url', function(req, res, next) {
	handleRequest(req, res, req.params.url);
});

module.exports = app;
