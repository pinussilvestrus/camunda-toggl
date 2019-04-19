const chai  = require('chai');
const expect = chai.expect;
const mock = require('mock-require');

mock('toggl-api', './mocks/toggl.mock.js');

const execute = require('../lib/core').execute;
const getLatestDescriptions = require('../lib/core').getLatestDescriptions;

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
                apiToken: 'test'
            }
    
            // when
            const timeEntry = await execute(options);

            // then
           expect(timeEntry).to.exist;
           expect(timeEntry.description).to.eql(options.description);
    
        });

    });


    describe('#getLatestDescriptions', function() {

        it('should get latest descriptions', async function() {

            // given 
            const options = {
                apiToken: 'test'
            }

            // when
            const descriptions =  await getLatestDescriptions(options);

            // then
            expect(descriptions).to.exist;
            expect(descriptions.length).to.equal(2);
        });


        it('should limit to given limitation', async function() {

            // given 
            const options = {
                apiToken: 'test',
                limit: 1
            }

            // when
            const descriptions =  await getLatestDescriptions(options);

            // then
            expect(descriptions).to.exist;
            expect(descriptions.length).to.equal(1);
        });
    });

});