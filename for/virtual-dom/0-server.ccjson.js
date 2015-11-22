
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

                        const CRYPTO = require("crypto");

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
                                "templateId": config.templateId || null,
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

//console.log("MASE cjsCode", cjsCode);

                                var code = [];

                                if (config.format === "commonjs") {

                                    if (config.wrapper === "firewidget.bundle") {

                                        code.push('PINF.bundle("", function(require){');
                                            code.push('require.memoize("/main.js", function(require, exports, module) {');
                                                code.push(cjsCode);
                                            code.push('});');
                                        code.push('});');

                                    } else {

                                        code.push(cjsCode);
                                    
                                    }

                                    code = code.join("\n");

                                } else {
                                    // DEPRECATED
                                    code.push('<script data-component-context="FireWidget/Bundle" data-component-location="window">\n');
                                    code.push('FireWidget.registerTemplate({');
                                    code.push(  'id: "%%__WIDGET_HASH_ID__%%",');
                                    code.push(  'getLayout: function () {');
                                    code.push(    'return {');
                                    code.push(      'id: "%%__WIDGET_HASH_ID__%%",');
                                    code.push(      'buildVTree: function (h, ch) {');
                                    code.push(        'return ' + chscript + ';');
                                    code.push(      '}');
                                    code.push(    '};');
                                    code.push(  '},');
                                    code.push(  'getComponents: function () {');
                                    code.push(    'return {');
                                    Object.keys(components).forEach(function (id, i) {
                                        code.push(      (i>0?",":"") + '"' + id + '": {');
                                        code.push(        'id: "' + id + ':%%__WIDGET_HASH_ID__%%",');
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

                                    code = code.join("\n");

                                    code = code.replace(/%%__WIDGET_HASH_ID__%%/g, (config.templateId || "") + ":" + CRYPTO.createHash("sha1").update(code).digest('hex'));
                                }
                                return callback(null, code);
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
