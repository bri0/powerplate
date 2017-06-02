module.exports = {
  promisifyCallback(func) {
    if (typeof func !== 'function') return Promise.resolve(null);
    return (...args) => new Promise((resolve, reject) => {
      args.push((err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
      func(...args);
    });
  },
  promisifyObjCallback(obj, funcName) {
    if (!obj || typeof obj[funcName] !== 'function') return Promise.resolve(null);
    return (...args) => new Promise((resolve, reject) => {
      args.push((err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
      obj[funcName](...args);
    });
  },
  promisifyJSON(func) {
    return (req, res, next) => {
      func(req, res)
      .then((...args) => {
        if (args && args.length > 0) res.json(args.length === 1 ? args[0] : args);
        next();
      })
      .catch(next);
    };
  },
};
