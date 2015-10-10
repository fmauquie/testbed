(function () {
  window.testConsole = {};
  window.testConsole.out = '';

  ['log', 'error', 'warn'].forEach(function (name) {
    window.testConsole[name] = function () {
      console[name].apply(console, arguments);
      this.out += Array.prototype.slice.call(arguments).map(function (value) {
        if (typeof value === 'undefined') {
          return 'undefined';
        }
        if (typeof value === 'function') {
          return 'function';
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return '' + value;
        }
        return JSON.stringify(value);
      }).join(' ') + '\n';
    };
  });

  window.evaluate = function (script) {
    window.currentEvaluation = {console: window.testConsole, window: window};
    window.testConsole.out = '';
    var toEval = '!function(console, window) {' +
      script +
      '}(window.currentEvaluation.console, window.currentEvaluation.window);';

    var out;
    try {
      window.eval(toEval);
      out = {error: false, result: window.testConsole.out};
    } catch (e) {
      return {error: true, result: e};
    } finally {
      delete window.currentEvaluation;
      window.testConsole.out = '';
    }

    return out;
  };
})();
