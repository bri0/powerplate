const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { promisifyCallback } = require('../lib/common/promise');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: String,
  google: String,
  tokens: Array,

  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String,
  },
}, { timestamps: true });

userSchema.index({ facebook: 1 });
userSchema.index({ google: 1 });
userSchema.index({ email: 1 });
userSchema.index({ passwordResetToken: 1 });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  return promisifyCallback(bcrypt.genSalt)(10).then((salt) =>
    promisifyCallback(bcrypt.hash)(user.password, salt, null)
  ).then((hash) => {
    user.password = hash;
    next();
  }).catch((err) => next(err));
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return promisifyCallback(bcrypt.compare)(candidatePassword, this.password);
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
