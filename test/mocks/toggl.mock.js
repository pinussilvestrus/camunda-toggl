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

module.exports = TogglAPI;