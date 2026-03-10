const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:    [{ type: String }],
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:    { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
