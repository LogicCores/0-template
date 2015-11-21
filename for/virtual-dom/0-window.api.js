
exports.forLib = function (LIB) {

    var exports = {};

    const h = LIB.vdom.h;
    var diff = LIB.vdom.diff;
    var patch = LIB.vdom.patch;
    const ch = require("../../../../lib/cvdom/ch");
    const createElement = LIB.vdom.createElement;


    exports.spin = function (context) {

        var defaultControllingState = {
            "$anchors": function (name) {
                return null;
            }
        };

        var Template = function (id, chscript) {
            var self = this;

            var cacheId = chscript.id || id;

            self.renderTo = function (targetDomNode, controllingState, options) {

                var targetDomElm = targetDomNode.get(0);

                controllingState = controllingState || defaultControllingState;
                options = options || {};

                if (LIB.VERBOSE) console.info("Trigger render for template '" + cacheId + "' if controllingState has changed:", controllingState);

                // We attach cache info to the target dom node as
                // we only act within it and can use the lifecycle of
                // the target dom node to manage our cache expiry.
                if (!targetDomElm._vdom_cache) {
                    targetDomElm._vdom_cache = {
                        templates: {}
                    };
                }

                if (!targetDomElm._vdom_cache.templates[cacheId]) {
                    targetDomElm._vdom_cache.templates[cacheId] = {
                        chscript: null,
                        controllingState: null,
                        controllingStateHash: null,
                        vtree: null,
                        rootNode: null
                    };
                }

                var tplCache = targetDomElm._vdom_cache.templates[cacheId];

                // We generate the vtree only if the template or data has changed
                // or we have nothing in cache.
                var previousVtree = tplCache.vtree || null;
                var nextVtree = tplCache.vtree || null;
                if (
                    chscript !== tplCache.chscript ||
                    controllingState !== tplCache.controllingState ||
                    controllingState.__snapshot_hash__ !== tplCache.controllingStateHash ||
                    !tplCache.vtree ||
                    options.forceCompleteRerender
                ) {
                    if (LIB.VERBOSE) console.info("Generate new vtree for template '" + cacheId + "'");
                    // Change detected
                    tplCache.controllingState = controllingState;
                    tplCache.controllingStateHash = controllingState.__snapshot_hash__;
                    tplCache.chscript = chscript;
                    tplCache.vtree = nextVtree = tplCache.chscript.buildVTree(
                        h,
                        ch(tplCache.controllingState)
                    );
                }


                function attachRootNode () {

                    // Detach previous rootNode
                    targetDomNode.children().each(function () {
                        var child = $(this);
                        if (child.attr("vdom-tpl-id")) {
                            child.detach();
                        }
                    });
                    // Remove all extra content just in case.
                    targetDomNode.empty();

                    // Attach/re-attach dom node
                    $(tplCache.rootNode).appendTo(targetDomNode);
                }

                if (
                    !tplCache.rootNode ||
                    !previousVtree ||
                    options.forceCompleteRerender
                ) {

                    if (LIB.VERBOSE) console.info("Create new DOM node for template '" + cacheId + "'");

                    // Generate new targetDomNode children
                    tplCache.rootNode = createElement(nextVtree);
                    $(tplCache.rootNode).attr("vdom-tpl-id", cacheId);
                    
                    attachRootNode();
                } else
                if (nextVtree !== previousVtree) {
                    // Patch targetDomNode children

                    if (LIB.VERBOSE) console.info("Patch existing DOM node for template '" + cacheId + "'");

                    tplCache.rootNode = patch(
                        tplCache.rootNode,
                        diff(previousVtree, nextVtree)
                    );

                    attachRootNode();
                } else {
                    if (LIB.VERBOSE) console.info("Use existing DOM node as-is for template '" + cacheId + "'");
                }
            }
        }

        return {
            Template: Template
        };
    }

    return exports;
}
