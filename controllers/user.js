const User = require('../models/User');
const { promisifyJSON, promisifyObjCallback } = require('../lib/common/promise');

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
};
