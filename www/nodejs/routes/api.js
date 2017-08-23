var express = require('express');
var router = express.Router();
var request = require('request');
var json2csv = require('json2csv');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/grove_bme280');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('mongodb connection success');
});

var raw_data = require('../models/raw_data');
var fields = ['Date', 'Time', 'T', 'H', 'P'];

router.get('/grove_bme280/json/refresh/:last', function(req, res, next) {
	var last = req.params.last;
	raw_data.find({'Time': {$gt: last}}, {_id: false}).sort({'Time': 1}).exec(function(err, data) {
		if(err) return res.status(500).send({error: 'database failure'});
		res.json(data);
	});
});

router.get('/grove_bme280/:format/:date', function(req, res, next) {
	if(req.params.format != 'json' && req.params.format != 'csv') {
		res.send("Invalid file format.");
		return;
	}
	if(req.params.date == 'all') {
		raw_data.find({}, {_id: false}).sort({'Time': 1}).exec(function(err, data) {
			if(err) return res.status(500).send({error: 'Database failure'});
			if(req.params.format == 'json') res.json(data);
			else if(req.params.format == 'csv') {
				var csv = json2csv({data: data, fields: fields});
				var cur = new Date();
				res.setHeader('Content-disposition', 'attachment; filename=all_' + cur.getFullYear() + '_' + (cur.getMonth() + 1) + '_' + cur.getDate() + '_' + cur.getHours() + '_' + cur.getMinutes() + '_' + cur.getSeconds() + '.csv');
				res.set('Content-Type', 'text/csv');
				res.status(200).send(csv);
			}
		});
	} else {
		var st = new Date(req.params.date);
		var en = new Date(req.params.date);
		st.setHours(st.getHours() + 7); // Add time offset of San Jose to UTC time.
		en.setHours(en.getHours() + 7); // Add time offset of San Jose to UTC time.
		en.setDate(en.getDate() + 1);
		raw_data.find({'Time': {$gte: st.getTime() / 1000.0, $lte: en.getTime() / 1000.0}}, {_id: false}).sort({'Time': 1}).exec(function(err, data) {
			if(err) return res.status(500).send({error:'database failure'});
			if(req.params.format == 'json') res.json(data);
			else if(req.params.format == 'csv') {
				var csv = json2csv({data: data, fields: fields});
				res.setHeader('Content-disposition', 'attachment; filename=date_' + st.getFullYear() + '_' + (st.getMonth() + 1) + '_' + st.getDate() + '_' + st.getFullYear() + '_' + (st.getMonth() + 1) + '_' + st.getDate() + '.csv');
				res.set('Content-Type', 'text/csv');
				res.status(200).send(csv);
			}
		});
	}
});

router.get('/grove_bme280/:format/:st/:en', function(req, res, next) {
	if(req.params.format != 'json' && req.params.format != 'csv') {
		res.send("Invalid file format.");
		return;
	}
	if(isNaN(Date.parse(req.params.st)) || isNaN(Date.parse(req.params.en))) {
		res.send("Invalid dates");
		return;
	}
	var st = new Date(req.params.st);
	var en = new Date(req.params.en);
	st.setHours(st.getHours() + 7); // Add time offset of San Jose to UTC time.
	en.setHours(en.getHours() + 7); // Add time offset of San Jose to UTC time.
	en.setDate(en.getDate() + 1);
	raw_data.find({'Time': {$gte: st.getTime() / 1000.0, $lt: en.getTime() / 1000.0}}, {_id: false}).sort({'Time': 1}).exec(function(err, data) {
		if(err) return res.status(500).send({error:'database failure'});
		if(req.params.format == 'json') res.json(data);
		else if(req.params.format == 'csv') {
			var csv = json2csv({data: data, fields: fields});
			en.setDate(en.getDate() - 1);
			res.setHeader('Content-disposition', 'attachment; filename=date_' + st.getFullYear() + '_' + (st.getMonth() + 1) + '_' + st.getDate() + '_' + en.getFullYear() + '_' + (en.getMonth() + 1) + '_' + en.getDate() + '.csv');
			res.set('Content-Type', 'text/csv');
			res.status(200).send(csv);
		}
	});
});

module.exports = router;
