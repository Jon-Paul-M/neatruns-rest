var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var runSchema = new Schema({
    ranBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    runDate: {
        type: Date,
        default: Date.now 
    },
    name: {
      type: String,
        default: ''
    },
    duration: Number,
    distance: Number,
    calories: Number,
    heartrate: Number,
    effort: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Run', runSchema);
