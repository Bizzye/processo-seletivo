// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
// Arquivos excluídos da cobertura ficam em angular.json > test > coverageExclude.

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {
        random: true,
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/processo-seletivo'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'lcovonly' }, { type: 'text-summary' }],
      check: {
        global: { statements: 90, branches: 90, functions: 90, lines: 90 },
      },
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    customLaunchers: {
      // Runners Linux (ex.: GitHub Actions/Ubuntu 24.04) bloqueiam o sandbox do Chrome.
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
