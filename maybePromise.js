/**
 * This file implements jasminewd's peculiar alternatives to Promise.resolve()
 * and Promise.all().  Do not use the code from this file as polyfill for
 * Promise.resolve() or Promise.all().  There are a number of reasons why this
 * implementation will cause unexpected errors in most codebases.
 *
 * Called "maybePromise" because both the parameters and the return values may
 * or may not be promises, and code execution may or may not be synchronous.
 */

/**
 * Runs a callback synchronously against non-promise values and asynchronously
 * against promises.  Similar to ES6's `Promise.resolve` except that it is
 * synchronous when possible and won't wrap the return value.
 *
 * This is not what you normally want.  Normally you want the code to be
 * consistently asynchronous, and you want the result wrapped into a promise.
 * But because of webdriver's control flow, we're better off not introducing any
 * extra layers of promises or asynchronous activity.
 *
 * @param {*} val The value to call the callback with.
 * @param {!Function} callback The callback function
 * @return {*} If val isn't a promise, the return value of the callback is
 *   directly returned.  If val is a promise, a promise (generated by val.then)
 *   resolving to the callback's return value is returned.
 */
var maybePromise = module.exports = function maybePromise(val, callback) {
  if (val && (typeof val.then == 'function')) {
    return val.then(callback);
  } else {
    return callback(val);
  }
}

/**
 * Like maybePromise() but for an array of values.  Analogous to `Promise.all`.
 *
 * @param {!Array<*>} vals An array of values to call the callback with
 * @param {!Function} callback the callback function
 * @return {*} If nothing in vals is a promise, the return value of the callback
 *   is directly returned.  Otherwise, a promise (generated by the .then
 *   functions in vals) resolving to the callback's return value is returned.
 */
maybePromise.all = function all(vals, callback) {
  var resolved = new Array(vals.length);
  function resolveAt(i) {
    if (i >= vals.length) {
      return callback(resolved);
    } else {
      return maybePromise(vals[i], function(val) {
        resolved[i] = val;
        return resolveAt(i+1);
      });
    }
  }
  return resolveAt(0);
}

