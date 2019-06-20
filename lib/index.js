#! /usr/bin/env node
const mri = require('mri');
const inquirer = require('inquirer');

const execute = require('./core').execute;
const getLatestDescriptions = require('./core').getLatestDescriptions;

var package = require('../package.json');

const args = mri(process.argv, {
    alias: {
        apiToken: [ 'a' ],
        description: [ 'd' ],
        end: [ 'e' ],
        help: [ 'h' ],
        start: [ 's' ],
        version: [ 'v' ]
    },
    default: {
        apiToken: process.env.TOGGL_API_TOKEN,
        end: '04:30PM', // todo(pinussilvestrus): make times more easier to input
        help: false,
        start: '08:00AM',
        version: false
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
    -v, --version                   show package version
    `);

    process.exit(0);
}

if(args.version) {
    console.log(`camunda-toggl@${package.version}`);

    process.exit(0);
}

if (!args.apiToken) {
    console.log(`No API token provided! 
    Go to https://toggl.com to get one, add 'TOGGL_API_TOKEN' environment variable or input via '-a' argument.
    `);

    process.exit(0);
}

run(args).then(
    (result) => {
        
        // display added entry
        console.log(`Added working time entry from ${result.start} to ${result.stop} (${result.duration / (60 * 60)}h)!`);
    },
    (err) => {
        console.error(err);

        process.exit(1);
    }
);

async function run(args) {

    const {
        apiToken,
        description
    } = args;

    if(!description) {

        // prompt for description

        const descriptions = await getLatestDescriptions({
            apiToken,
            limit: 5
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'description',
                message: 'Select a description',
                choices: descriptions
            }
        ]);

        Object.assign(args, {
            description: answer.description
        })

    }

    return await execute(args);

}
