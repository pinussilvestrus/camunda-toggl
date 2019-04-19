function TogglAPI() {
}

TogglAPI.prototype.getWorkspaces = function(callback) {
    return callback(null, [{
        id: '1'
    }]);
}

TogglAPI.prototype.getWorkspaceProjects = function(wid, callback) {
    return callback(null, [{
        id: '1',
        name: 'Camunda'
    }]);
}

TogglAPI.prototype.createTimeEntry = function(options, callback) {
    return callback(null, options)
}

TogglAPI.prototype.getTimeEntries = function(start, end, callback) {
    return callback(null, [{
        id: '1',
        description: 'foo'
    },
    {
        id: '2',
        description: 'bar'
    }]);
}

module.exports = TogglAPI;