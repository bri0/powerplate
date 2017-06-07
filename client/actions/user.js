const { register } = require('../actions');
const { postRequest } = require('../rest');

register('onReady', () => {
  if ($('input.swal-on-ready.hidden')) {
    const data = $('input.swal-on-ready.hidden').data('object');
    if (data && data.swal && data.swal.length) {
      const token = data.swal[0].token;
      swal(data.swal[0]).then((password) =>
        postRequest(`/reset/${token}`, { password }).then(({ entity }) => {
          if (entity.status !== 'OK') return Promise.reject('Something wrong');
          return swal({
            title: 'Success!',
            text: 'Your password has been changed.',
            type: 'success',
          });
        })
        .then(() => window.location.reload())
        .catch(({ entity }) => Promise.reject(entity.message || 'Server Error'))
      ).catch((err) => {
        if (err !== 'cancel' && err !== 'overlay' && err !== 'esc') {
          swal('Problem', err, 'error');
        }
      });
    }
  }
});

register('userLogout', () => {
  postRequest('/api/logout')
  .then(() => window.location.reload())
  .catch(() => window.location.reload());
});

register('userLogin', () => {
  swal({
    confirmButtonText: 'Next &rarr;',
    title: 'Login',
    input: 'email',
    text: 'Enter your email',
  }).then((email) => {
    console.log(email);
    return swal.queue([{
      confirmButtonText: 'Login',
      title: 'Login',
      input: 'password',
      text: 'Enter your password',
      showLoaderOnConfirm: true,
      animation: false,
      preConfirm(password) {
        return postRequest('/api/login', { email, password }).then(({ entity }) => {
          if (entity.status === 'OK') {
            swal.insertQueueStep({
              title: 'Congrats!',
              text: 'You\'re successfully logged in!',
              type: 'success',
            });
            return Promise.resolve();
          }
          return Promise.reject({ entity: { message: 'Server Error!' } });
        }).catch(({ entity }) => {
          const msg = entity.message || 'Server Error';
          swal.insertQueueStep({
            title: 'Problem',
            text: msg,
            type: 'error',
          });
          return Promise.resolve();
        });
      },
    }]);
  }).then(() => {
    window.location.reload();
  }).catch((err) => {
    if (err !== 'cancel' && err !== 'overlay' && err !== 'esc') {
      swal('Problem', err, 'error');
    }
  });
});

register('userCreate', () => {
  swal({
    confirmButtonText: 'Next &rarr;',
    title: 'Create Account',
    showCancelButton: false,
    input: 'email',
    text: 'Enter your email',
    progressSteps: ['1', '2'],
    currentProgressStep: 0,
    showLoaderOnConfirm: true,
    preConfirm(email) {
      return postRequest('/api/checkEmail', { email }).then(({ entity }) => {
        if (entity.status !== 'OK') return Promise.reject('Something wrong');
        return Promise.resolve(email);
      }).catch(({ entity }) => Promise.reject(entity.message || 'Server Error'));
    },
  }).then((email) => {
    console.log(email);
    return swal.queue([{
      confirmButtonText: 'Submit',
      title: 'Create Account',
      showCancelButton: false,
      input: 'password',
      text: 'Enter your password',
      showLoaderOnConfirm: true,
      progressSteps: ['1', '2'],
      currentProgressStep: 1,
      animation: false,
      preConfirm(password) {
        return postRequest('/api/signup', { email, password }).then(({ entity }) => {
          if (entity.status === 'OK') {
            swal.insertQueueStep({
              title: 'Account Created!',
              text: 'You will be automatically login!',
              type: 'success',
            });
            return Promise.resolve();
          }
          return Promise.reject({ entity: { message: 'Server Error!' } });
        }).catch(({ entity }) => {
          const msg = entity.message || 'Server Error';
          if (entity.param && entity.param === 'password') return Promise.reject(msg);
          swal.insertQueueStep({
            title: 'Problem',
            text: msg,
            type: 'error',
          });
          return Promise.resolve();
        });
      },
    }]);
  }).then(() => {
    window.location.reload();
  }).catch((err) => {
    if (err !== 'cancel' && err !== 'overlay' && err !== 'esc') {
      swal('Problem', err, 'error');
    }
  });
});

register('forgotPassword', () => {
  swal.queue([{
    confirmButtonText: 'Next &rarr;',
    title: 'Forgot Password',
    input: 'email',
    text: 'Enter your email',
    showLoaderOnConfirm: true,
    preConfirm(email) {
      return postRequest('/api/forgotPassword', { email }).then(({ entity }) => {
        if (entity.status !== 'OK') return Promise.reject('Something wrong');
        swal.insertQueueStep({
          title: 'Email Sent!',
          text: `An e-mail has been sent to ${email} with further instructions.`,
          type: 'success',
        });
        return Promise.resolve(email);
      }).catch(({ entity }) => Promise.reject(entity.message || 'Server Error'));
    },
  }]).catch((err) => {
    if (err !== 'cancel' && err !== 'overlay' && err !== 'esc') {
      swal('Problem', err, 'error');
    }
  });
});
