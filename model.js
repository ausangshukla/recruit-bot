var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatbot_dev', { useMongoClient: true });
mongoose.Promise = global.Promise;


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


var responseSchema = mongoose.Schema({
    company: String,
    intent: String,
    action: String,
    messages: [],
    quick_replies: [{reply: String}]
});

responseSchema.query.byIntent = function(intent) {
  return this.find({ intent: intent });
};

responseSchema.query.byAction = function(action) {
  return this.find({ action: action });
};


module.exports = {
	response: function() {
		return mongoose.model('Response', responseSchema);
	},
}
