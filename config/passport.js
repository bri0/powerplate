const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }).then((user) => {
    if (!user) return Promise.reject({ msg: `Email ${email} not found.` });
    return Promise.all([user, user.comparePassword(password)]);
  }).then(([user, isMatch]) => {
    if (isMatch) return done(null, user);
    return Promise.reject(new Error('Invalid email or password.'));
  }).catch((err) => done(err));
}));
/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_ID,
//   clientSecret: process.env.FACEBOOK_SECRET,
//   callbackURL: '/auth/facebook/callback',
//   profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
//   passReqToCallback: true,
// }, (req, accessToken, refreshToken, profile, done) => {
//   if (req.user) {
//     User.findOne({ facebook: profile.id }).then((user) => {
//       if (user) return Promise.reject(new Error('There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'));
//       return User.findById(req.user.id);
//     }).then((user) => {
//       user.facebook = profile.id;
//       user.tokens.push({ kind: 'facebook', accessToken });
//       user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
//       user.profile.gender = user.profile.gender || profile._json.gender; // eslint-disable-line
//       user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
//       return user.save;
//     }).then((user) => {
//       req.flash('info', { msg: 'Facebook account has been linked!' });
//       done(null, user);
//     }).catch((err) => {
//       req.flash('errors', err.message);
//       done(err);
//     });
//   } else {
//     User.findOne({ facebook: profile.id }).then((user) => {
//       if (user) Promise.reject(new Error('There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'));
//       const newUser = new User();
//       newUser.email = profile._json.email; // eslint-disable-line
//       newUser.facebook = profile.id;
//       newUser.tokens.push({ kind: 'facebook', accessToken });
//       newUser.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
//       newUser.profile.gender = profile._json.gender; // eslint-disable-line
//       newUser.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
//       newUser.profile.location = (profile._json.location) ? profile._json.location.name : ''; // eslint-disable-line
//       return newUser.save();
//     })
//     .then((user) => done(null, user))
//     .catch((err) => {
//       req.flash('info', { msg: err.message });
//       done(err);
//     });
//   }
// }));

// *
//  * Sign in with Google.

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_ID,
//   clientSecret: process.env.GOOGLE_SECRET,
//   callbackURL: '/auth/google/callback',
//   passReqToCallback: true,
// }, (req, accessToken, refreshToken, profile, done) => {
//   if (req.user) {
//     User.findOne({ google: profile.id }).then((user) => {
//       if (user) Promise.reject(new Error('There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'));
//       return User.findById(req.user.id);
//     }).then((user) => {
//       if (!user) Promise.reject(new Error('There was problem with your account!'));
//       user.google = profile.id;
//       user.tokens.push({ kind: 'google', accessToken });
//       user.profile.name = user.profile.name || profile.displayName;
//       user.profile.gender = user.profile.gender || profile._json.gender; // eslint-disable-line
//       user.profile.picture = user.profile.picture || profile._json.image.url; // eslint-disable-line
//       return user.save;
//     }).then((user) => {
//       req.flash('info', { msg: 'Google account has been linked.' });
//       done(null, user);
//     }).catch((err) => {
//       req.flash('errors', { msg: err.message });
//       done(err);
//     });
//   } else {
//     User.findOne({ google: profile.id }).then((user) => {
//       if (user) return Promise.resolve(user);
//       return User.findOne({ email: profile.emails[0].value }).then((other) => {
//         if (other) Promise.reject(new Error('There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'));
//         const newUser = new User();
//         newUser.email = profile.emails[0].value;
//         newUser.google = profile.id;
//         newUser.tokens.push({ kind: 'google', accessToken });
//         newUser.profile.name = profile.displayName;
//         newUser.profile.gender = profile._json.gender; // eslint-disable-line
//         newUser.profile.picture = profile._json.image.url; // eslint-disable-line
//         return newUser.save();
//       });
//     }).then((user) => {
//       if (!user) return Promise.reject(new Error('Error with server, please try again!'));
//       return done(null, user);
//     }).catch((err) => {
//       req.flash('errors', { msg: err.message });
//       done(err);
//     });
//   }
// }));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => (req.isAuthenticated() ? next() : res.redirect('/login'));

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find((t) => (t.kind === provider));
  return (token) ? next() : res.redirect(`/auth/${provider}`);
};
