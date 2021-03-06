#!/usr/bin/env node
var foreground = require('foreground-child'),
  sw = require('spawn-wrap')

if (process.env.NYC_CWD) {
  var NYC = require('../')
  ;(new NYC()).wrap()

  // make sure we can run coverage on
  // our own index.js, I like turtles.
  var name = require.resolve('../')
  delete require.cache[name]

  sw.runMain()
} else {
  var NYC = require('../'),
    yargs = require('yargs')
      .usage('$0 [command] [options]\n\nrun with a file as the first argument, to instrument it with coverage')
      .command('report', 'run coverage report on nyc_output', function (yargs) {
        yargs
          .option('r', {
            alias: 'reporter',
            describe: 'coverage reporter to use',
            default: 'text'
          })
          .help('h')
          .example('$0 report --reporter=lcov', 'output an HTML lcov report to ./coverage')
          .alias('h', 'help')
      })
      .help('h')
      .alias('h', 'help')
      .version(require('../package.json').version)
      .example('$0 npm test', 'instrument your tests with coverage')
      .example('$0 report --reporter=text-lcov', 'output lcov report after running your tests')
      .epilog('visit http://git.io/vTJJB for list of available reporters'),
    argv = yargs.argv

  if (argv._.length && ~argv._.indexOf('report')) {
    // run a report.
    process.env.NYC_CWD = process.cwd()

    ;(new NYC({
      reporter: argv.reporter
    })).report()
  } else if (argv._.length) {
    // wrap subprocesses and execute argv[1]
    ;(new NYC()).cleanup()

    sw([__filename], {
      NYC_CWD: process.cwd()
    })

    foreground(process.argv.slice(2))
  } else {
    // I don't have a clue what you're doing.
    yargs.showHelp()
  }
}
