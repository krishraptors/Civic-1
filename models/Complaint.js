const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: false, trim: true },
  photos: [{ type: String }], // store file paths or URLs
  location: {
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  category: { type: String, default: 'general' }, // e.g. pothole, garbage, streetlight
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // optional: resolution notes or evidence photos
  resolutionNotes: { type: String },
  resolutionPhotos: [{ type: String }]
});

complaintSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
