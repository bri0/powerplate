const User = require('../models/User');
const { promisifyJSON, promisifyObjCallback } = require('../lib/common/promise');
const { sendMail } = require('../lib/common/mandrill');
const random = require('../lib/common/random');
const xtmpl = require('../lib/common/xtmpl');
const resetPasswordTpl = require('../lib/templates/resetPassword.html');
/**
 * GET /login
 * Login page.
 */
module.exports = {
  postSignup: promisifyJSON((req) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.sanitize('email').normalizeEmail({ remove_dots: false });
    const errors = req.validationErrors();
    if (errors) {
      const { param, msg } = errors[0];
      console.log(errors);
      return Promise.reject({ param, message: msg });
    }

    const { email, password } = req.body;
    return User.findOne({ email }).then((user) => {
      if (user) return Promise.reject({ message: 'Can not register with this email' });
      return new User({ email, password }).save();
    }).then((user) => promisifyObjCallback(req, 'logIn')(user))
    .then(() => ({ status: 'OK', message: 'New user Created!' }));
  }),
  postCheckEmail: promisifyJSON((req) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
    const errors = req.validationErrors();
    if (errors) return Promise.reject(errors);
    const { email } = req.body;
    return User.findOne({ email }).then((user) => {
      if (user) return Promise.reject(new Error('Can not register with this email'));
      return { status: 'OK' };
    });
  }),
  postLogout: promisifyJSON((req) => {
    req.logout();
    return Promise.resolve({ status: 'OK' });
  }),
  postLogin: promisifyJSON((req) => {
    const { email, password } = req.body;
    const error = { message: 'Invalid Email or Password' };
    if (!email || !password) return Promise.reject(error);
    return User.findOne({ email }).then((user) => {
      console.log(user);
      if (!user) return Promise.reject(error);
      return user.comparePassword(password).then((samePassword) => {
        if (!samePassword) return Promise.reject(error);
        return user;
      });
    }).then((user) => promisifyObjCallback(req, 'logIn')(user))
    .then(() => ({ status: 'OK', message: 'Logged' }));
  }),
  postForgotPassword: promisifyJSON((req) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
    const errors = req.validationErrors();
    if (errors) return Promise.reject(errors);
    const { email } = req.body;
    return User.findOne({ email }).then((user) => {
      if (!user) return Promise.resolve();
      user.passwordResetToken = random.chars(16);
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      return user.save();
    }).then((user) => {
      if (!user) return Promise.resolve();
      return sendMail({
        subject: 'Reset your password on Powerplate',
        recipient: { email },
        content: xtmpl(resetPasswordTpl, { resetPasswordURL: `http://${req.headers.host}/reset/${user.passwordResetToken}` }),
        fromEmail: 'tonny@powerplate.com',
      });
    }).then(() => ({ status: 'OK' }));
  }),
  getResetPassword(req, res) {
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        } else {
          req.flash('swal', { title: 'Reset Password', input: 'password', text: 'Please enter new password', token: req.params.token });
        }
        res.redirect('/');
      });
  },
  postResetPassword: promisifyJSON((req) => {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    const errors = req.validationErrors();
    if (errors) {
      const { param, msg } = errors[0];
      console.log(errors);
      return Promise.reject({ param, message: msg });
    }
    return User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          return Promise.reject(new Error('Password reset token is invalid or has expired.'));
        }
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.password = req.body.password;
        return user.save();
      })
      .then((user) => promisifyObjCallback(req, 'logIn')(user))
      .then(() => ({ status: 'OK', message: 'Your password has been changed.' }));
  }),
};
