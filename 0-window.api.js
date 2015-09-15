
exports.forLib = function (LIB) {
    
    var exports = {};

    // TODO: Load adapters as needed on demand
    
    exports.adapters = {
        firewidgets: require("./for/firewidgets/0-server.api").forLib(LIB)
    };

    return exports;
}
