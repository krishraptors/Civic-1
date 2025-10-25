const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images are allowed (jpeg, jpg, png)'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
