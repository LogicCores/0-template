
exports.forLib = function (LIB) {
    var ccjson = this;

    const ESCAPE_REGEXP_COMPONENT = require("escape-regexp-component");
    const HTML_TO_HSCRIPT = require('../../../../lib/html2hscript');

    return LIB.Promise.resolve({
        forConfig: function (defaultConfig) {

            var Entity = function (instanceConfig) {
                var self = this;

                self.AspectInstance = function (aspectConfig) {

                    var config = {};
                    LIB._.merge(config, defaultConfig)
                    LIB._.merge(config, instanceConfig)
                    LIB._.merge(config, aspectConfig)

                    function transform (html) {
                        return LIB.Promise.promisify(function (callback) {

                            html = html.replace(/^\s*|\s*$/g, "");

console.log("--------------------- html ---------------------");
process.stdout.write(html);
console.log("--------------------- html ---------------------");

                            return HTML_TO_HSCRIPT(html, {
                                
                            }, function(err, hscript) {
                                if (err) return callback(err);
                                
console.log("--------------------- VDOM HSCRIPT ---------------------");
process.stdout.write(hscript);
console.log("--------------------- VDOM HSCRIPT ---------------------");

                                return callback(null, html);
                            });
                        })();
                    }

                    return LIB.Promise.resolve({
                        transformer: function () {
                            return LIB.Promise.resolve(
                                ccjson.makeDetachedFunction(
                                    function (input) {

                                        return LIB.Promise.resolve(
                                            transform(input)
                                        );
                                    }
                                )
                            );
                        }
                    });
                }
            }
            Entity.prototype.config = defaultConfig;

            return Entity;
        }
    });
}
