
exports.forLib = function (LIB) {
    var ccjson = this;

    return LIB.Promise.resolve({
        forConfig: function (defaultConfig) {

            var Entity = function (instanceConfig) {
                var self = this;

                self.AspectInstance = function (aspectConfig) {

                    var config = {};
                    LIB._.merge(config, defaultConfig);
                    LIB._.merge(config, instanceConfig);
                    LIB._.merge(config, aspectConfig);

                    function transform (html, callConfig) {

                        var config = {};
                        LIB._.merge(config, defaultConfig);
                        LIB._.merge(config, instanceConfig);
                        LIB._.merge(config, aspectConfig);
                        LIB._.merge(config, callConfig);

                        return LIB.Promise.promisify(function (callback) {

                            html = html.replace(/^\s*|\s*$/g, "");
/*
console.log("--------------------- html ---------------------");
process.stdout.write(html);
console.log("--------------------- html ---------------------");
*/

                            var scriptLocations = {};
                            scriptLocations[config.location || "window"] = true;

                            var CVDOM = require('../../../../lib/cvdom'); CVDOM = CVDOM.forLib(CVDOM.makeLib());

                            return CVDOM.html2chscript(html, {
                                "controlAttributes": {
                                    "prefix": "data-component-",
                                    "remove": true,
                                    "scriptLocations": scriptLocations
                                }
                            }, function(err, chscript, components, inlineScripts, cjsCode) {
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

                                    code.push(cjsCode);
                                    
                                } else {
                                    // DEPRECATED
                                    code.push('<script data-component-context="FireWidget/Bundle" data-component-location="window">\n');
                                    code.push('FireWidget.registerTemplate({');

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
                                    code.push('var scripts = {};');
                                    inlineScripts.forEach(function (inlineScript) {
                                        code.push('if (!scripts["' + inlineScript.id + '"]) { scripts["' + inlineScript.id + '"] = {}; }');
                                        code.push('scripts["' + inlineScript.id + '"]["' + inlineScript.location + '"] = function (exports) {');
                                            code.push(inlineScript.code);
                                        code.push('};');
                                    });
                                    code.push('return scripts;');
                                    code.push(  '}');
                                    code.push('});');
                                    code.push('\n</script>');
                                }
                                return callback(null, code.join("\n"));
                            });
                        })();
                    }

                    return LIB.Promise.resolve({
                        transformer: function () {
                            return LIB.Promise.resolve(
                                ccjson.makeDetachedFunction(
                                    function (input, config) {

                                        return LIB.Promise.resolve(
                                            transform(input, config)
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
