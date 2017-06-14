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
  getProfile(req, res) {
    res.render('account/profile');
  },
  postUpdateProfile: promisifyJSON((req) => {
    const errors = req.validationErrors();
    if (errors) {
      console.log(errors);
      return Promise.reject({ errors });
    }
    const user = req.user;
    user.profile.name = req.body.name || user.profile.name;
    user.email = req.body.email || user.email;
    user.profile.gender = req.body.gender || user.profile.gender;
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    return user.save()
    .then((u, err) => {
      if (err) {
        console.log(err);
        return Promise.reject(new Error(err.message));
      }
      return { status: 'OK', message: 'Profile information has been updated.' };
    });
  }),
  postChangePassword: promisifyJSON((req) => {
    req.assert('newPassword', 'Password must be at least 4 characters long').len(4);
    const errors = req.validationErrors();
    if (errors) {
      const { param, msg } = errors[0];
      return Promise.reject({ param, message: msg });
    }
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    return user.comparePassword(currentPassword)
    .then((samePassword) => {
      if (!samePassword) return Promise.reject(new Error('Current password is invalid'));
      return user;
    })
    .then((u) => {
      u.password = newPassword;
      return u.save();
    })
    .then((u, err) => {
      if (err) {
        console.log(err);
        return Promise.reject(new Error(err.message));
      }
      return { status: 'OK' };
    });
  }),
};
