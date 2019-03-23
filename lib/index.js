const Toggl = require('toggl-api');
const mri = require('mri');
const _ = require('lodash');

const args = mri(process.argv, {
    alias: {
        description: [ 'd' ],
        apiToken: [ 'a' ],
        help: [ 'h' ]
    },
    default: {
        help: false,
        apiToken: process.env.TOGGL_API_TOKEN
    }
});

if (args.help) {
    console.log(`usage: camunda-toggl [-d DESCRIPTION]
    Easily create time entries for camunda work on toggl.
    Options:
    -d, --description=DESCRIPTION task description
    -c, --commit                  commit book
    -a, --apiToken                toggl API token
    -h, --help                    print this help
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

/** IMPLEMENTATION */


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

async function run(args) {

    const {
        apiToken,
        description
    } = args;

    const toggl = new Toggl({ apiToken });

    const project = await getCamundaProject({ toggl });

    return new Promise((resolve, reject) => {
        
        // todo(pinussilvestrus): fetch real time data
        toggl.createTimeEntry({
            start: new Date(),
            duration: 120,
            pid: project.id,
            description,
            billable: false
        }, (err, timeEntry) => {
            if (err) {
                reject(err);
            }
       
            resolve(timeEntry);
        });
    });

}