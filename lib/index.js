#! /usr/bin/env node
const Toggl = require('toggl-api');
const mri = require('mri');
const moment = require('moment');
const _ = require('lodash');

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
    console.log(`usage: camunda-toggl [-d DESCRIPTION]
    Easily create time entries for camunda work on toggl.
    Options:
    -a, --apiToken                toggl API token
    -d, --description=DESCRIPTION task description
    -e, --end=END_TIME            end time, e.g. 04:30PM
    -h, --help                    print this help
    -s, --start=START_TIME        start time, e.b. 08:00AM
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

/******* IMPLEMENTATION */

/**
 * Fetches all workspaces from current user.
 * @param {toggl} options.toggl
 * 
 * @returns {Array<Workspace>}
 */
async function getWorkspace(options) {

    const {
        toggl
    } = options;

    return new Promise((resolve, reject) => {
        toggl.getWorkspaces((err, workspaces) => {
            if (err) {
                reject(err)
            }

            resolve(workspaces[0] || {});
        });
    });

}

/**
 * Fetches all projects for given workspace.
 * @param {toggl} options.toggl
 * @param {Workspace} options.workspace
 * 
 * @returns {Array<Project>}
 */
async function getWorkspaceProjects(options) {

    const  {
        toggl,
        workspace
    } = options;

    return new Promise((resolve, reject) => {
        toggl.getWorkspaceProjects(workspace.id, (err, projects) => {
            if (err) {
                reject(err);
            }

            resolve(projects);
        });
    })
} 

/**
 * Fetches Camunda Project data.
 * @param {toggl} options.toggl
 * 
 * @returns {Project}
 */
async function getCamundaProject(options) {

    const {
        toggl
    } = options;

    const workspace = await getWorkspace({ toggl });
    const projects = await getWorkspaceProjects({ toggl, workspace });

    // todo(pinussilvestrus): add project argument
    return _.find(projects, (p) => p.name === 'Camunda');
}

/**
 * Generates date strings for later requests.
 * @param {String} options.end
 * @param {String} options.start
 * 
 * @returns {Object}
 */
function generateDates(options) {
    
    const {
        end,
        start
    } = options;

    const today = moment().format('YYYY-MM-DD');

    // start
    let amOrPm = isAM(start) ? 'AM' : 'PM';
    const startHour = getHourFrom(start, amOrPm);
    const startTime = moment(`${today}T${startHour} ${amOrPm}`, 'YYYY-MM-DDThh:mm A');

     // end
     amOrPm = isAM(end) ? 'AM' : 'PM';
     const endHour = getHourFrom(end, amOrPm);
     const endTime = moment(`${today}T${endHour} ${amOrPm}`, 'YYYY-MM-DDThh:mm A');

     // duration
     const duration = moment.duration(endTime.diff(startTime)).asSeconds();

    return {
        endTime,
        duration,
        startTime
    }

}

async function run(args) {

    const {
        apiToken,
        description,
        end,
        start
    } = args;

    const toggl = new Toggl({ apiToken });

    const project = await getCamundaProject({ toggl });

    const {
        endTime,
        duration,
        startTime
    } = generateDates({ end, start });

    return new Promise((resolve, reject) => {
        
        toggl.createTimeEntry({
            billable: false,
            description,
            duration,
            pid: project.id,
            start: startTime,
            stop: endTime
        }, (err, timeEntry) => {
            if (err) {
                reject(err);
            }
       
            resolve(timeEntry);
        });
    });

}

/******* HELPER */

/**
 * Indicates whether date string is AM or PM.
 * @param {String} dateString 
 * 
 * @returns {Boolean}
 */
function isAM(dateString) {
    return dateString.includes('AM');
}

/**
 * Gets hour number from date string.
 * @param {String} dateString 
 * @param {String} remove 
 * 
 * @returns {String}
 */
function getHourFrom(dateString, remove) {
    return dateString.replace(remove, '');
}
