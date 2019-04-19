const moment = require('moment');
const _ = require('lodash');
const Toggl = require('toggl-api');

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

/**
 * Fetches time entries in given time span
 * @param {Date} options.end
 * @param {Date} options.start
 * @param {toggl} options.toggl
 * 
 * @returns {Array}
 */
async function getTimeEntries(options) {

    const {
        end,
        start,
        toggl
    } = options;

    return new Promise((resolve, reject) => {
        toggl.getTimeEntries(start, end, (error, timeEntries) => {
            
            if(error) {
                reject(error);
            } 

            resolve(timeEntries);
        });
    });
}

/**
 * Fetches latest (limited by given number) used descriptions
 * @param {String} options.apiToken
 * @param {Number} options.limit
 * 
 * @returns {Array<String>} 
 */
async function getLatestDescriptions(options) {

    const {
        apiToken
    } = options;

    let {
        limit
    } = options;

    if(!limit) {
        limit = 5;
    }

    const toggl = new Toggl({ apiToken });

    const start = toIso(moment().subtract(1, 'months')); // 1 month ago
    const end = toIso(moment());

    const timeEntriesData = await getTimeEntries({
        end,
        start,
        toggl
    });

    const timeEntries = 
        removeDuplicates(timeEntriesData, 'description')
        .map(t => t.description)
        .slice(0, limit);

    return timeEntries;

}

async function execute(options) {
    
    const {
        apiToken,
        description,
        end,
        start
    } = options;


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

module.exports = {
    execute,
    getLatestDescriptions
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

/**
 * Converts Moment date to  ISO string
 * @param {Moment} date 
 * 
 * @returns {String}
 */
function toIso(date) {
    return date.toISOString();
}

/**
 * Removes duplicates from data set by given key
 * @param {Array} data 
 * 
 * @returns {Array}
 */
function removeDuplicates(data, key) {
    return _.uniqBy(data, e => {
        return e[key];
    });
}