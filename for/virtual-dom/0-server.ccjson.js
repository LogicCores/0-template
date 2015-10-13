
exports.forLib = function (LIB) {
    var ccjson = this;

    const ESCAPE_REGEXP_COMPONENT = require("escape-regexp-component");
    var CVDOM = require('../../../../lib/cvdom'); CVDOM = CVDOM.forLib(CVDOM.makeLib());

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
/*
console.log("--------------------- html ---------------------");
process.stdout.write(html);
console.log("--------------------- html ---------------------");
*/
                            return CVDOM.html2hscript(html, {
                                "controlAttributes": {
                                    "prefix": "data-component-",
                                    "remove": true,
                                    "scriptLocations": {
                                        "window": true
                                    }
                                }
                            }, function(err, chscript, components, inlineScripts) {
                                if (err) return callback(err);

//console.log("components", components);

/*
console.log("--------------------- VDOM HSCRIPT ---------------------");
process.stdout.write(hscript);
console.log("inlineScripts", inlineScripts);
console.log("--------------------- VDOM HSCRIPT ---------------------");
*/

//console.log("TRANSFORM CONFIG", config);

                                var code = [];
                                
                                if (config.format === "commonjs") {
                                    code.push('module.exports = {');
                                } else {
                                    // DEPRECATE
                                    code.push('<script data-component-context="FireWidget/Bundle" data-component-location="window">\n');
                                    code.push('FireWidget.registerTemplate({');
                                }
                                code.push(  'getLayout: function () {');
                                code.push(    'return {');
                                code.push(      'buildVTree: function (h, ch) {');
                                code.push(        'return ' + chscript + ';');
                                code.push(      '}');
                                code.push(    '};');
                                code.push(  '},');
                                code.push(  'getComponents: function () {');
                                code.push(    'return {');
                                Object.keys(components).forEach(function (id, i) {
                                    code.push(      (i>0?",":"") + '"' + id + '": {');
                                    code.push(        'buildVTree: function (h, ch) {');
                                    code.push(          'return ' + components[id].chscript + ';');
                                    code.push(        '}');
                                    code.push(      '}');
                                });
                                code.push(  '  };');
                                code.push(  '},');
                                code.push(  'getScripts: function () {');
                                code.push(    'return ' + JSON.stringify(inlineScripts) + ';');
                                code.push(  '}');
                                if (config.format === "commonjs") {
                                    code.push('};');
                                } else {
                                    // DEPRECATE
                                    code.push('});');
                                    code.push('\n</script>');
                                }
                                return callback(null, code.join(""));
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
