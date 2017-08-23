var mongoose = require('mongoose');
var rawDataSchema = mongoose.Schema({
	'Date': { type: String, index: true },
	'Time': Number,
	'T': Number,
	'H': Number,
	'P': Number,
});

module.exports = mongoose.model('raw_data', rawDataSchema);
