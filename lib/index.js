#! /usr/bin/env node
const mri = require('mri');
const execute = require('./core').execute;

const args = mri(process.argv, {
    alias: {
        apiToken: [ 'a' ],
        description: [ 'd' ],
        end: [ 'e' ],
        help: [ 'h' ],
        start: [ 's' ]
    },
    default: {
        apiToken: process.env.TOGGL_API_TOKEN,
        end: '04:30PM', // todo(pinussilvestrus): make times more easier to input
        help: false,
        start: '08:00AM'
    }
});

if (args.help) {
    console.log(`usage: camunda-toggl [-d DESCRIPTION] [-s START_TIME] [-e END_TIME]
    Easily create time entries for camunda work on toggl.
    Options:
    -a, --apiToken=API_TOKEN        toggl API token
    -d, --description=DESCRIPTION   task description
    -e, --end=END_TIME              end time, e.g. 04:30PM
    -h, --help                      print this help
    -s, --start=START_TIME          start time, e.b. 08:00AM
    `);

    process.exit(0);
}

if (!args.apiToken) {
    console.log(`No API token provided! 
    Go to https://toggl.com to get one, add 'TOGGL_API_TOKEN' environment variable or input via '-a' argument.
    `);

    process.exit(0);
}

run(args).then(
    () => console.log('Done.'),
    (err) => {
        console.error(err);

        process.exit(1);
    }
);

async function run(args) {

    return await execute(args);

}
