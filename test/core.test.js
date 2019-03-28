const chai  = require('chai');
const expect = chai.expect;
const mock = require('mock-require');

mock('toggl-api', './mocks/toggl.mock.js');

const execute = require('../lib/core').execute;

chai.use(require('sinon-chai'));
require('mocha-sinon');

describe('core', function() {

    describe('#execute', function() {

        it('should create time entry', async function() {

            // given
            const options = {
                description: 'test',
                start: '08:00AM',
                end: '04:00PM',
                apiKey: "test"
            }
    
            // when
            const timeEntry = await execute(options);

            // then
           expect(timeEntry).to.exist;
           expect(timeEntry.description).to.eql(options.description);
    
        });

    });

});