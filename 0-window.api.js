
exports.forLib = function (LIB) {

    var exports = {};

    // TODO: Load adapters as needed on demand

    exports.adapters = {
        firewidgets: require("./for/firewidgets/0-window.api").forLib(LIB),
        "virtual-dom": require("./for/virtual-dom/0-window.api").forLib(LIB),
    };

    exports.forContexts = function (contexts) {

        var exports = {};

        var Context = exports.Context = function (defaults) {
            var self = this;

            var state = {
            };
            LIB._.merge(state, LIB._.cloneDeep(defaults));

        }
        Context.prototype = Object.create(LIB.EventEmitter.prototype);
        Context.prototype.contexts = contexts;

        return exports;
    }

    return exports;
}
