
exports.forLib = function (LIB) {

    const h = LIB.vdom.h;
    const ch = require("../../../../lib/cvdom/ch");
    const createElement = LIB.vdom.createElement;

	var templateIndex = 0;
	function getNextRandomKey () {
		templateIndex++;
		return "key-" + templateIndex;
	}

    var exports = {};

    exports.spin = function (context) {
        
        var jQueryTemplate = function () {
            var self = this;
            
            self.domNode = null;
            self.sections = {};
        }


        jQueryTemplate.prototype.attachDomNode = function (domNode) {
            var self = this;

			self.domNode = domNode;

            // Hide all non-section views by default
			$('[data-component-view]', self.domNode).each(function () {
				var e = $(this);
				if (typeof e.attr("data-component-section") !== "undefined") return;
//					e.hide();
				e.addClass("hidden");
			});

            // Lift all sections
    		$('[data-component-section][data-component-view]', self.domNode).each(function () {
    			var sectionElement = $(this);
    			var sectionName = sectionElement.attr("data-component-section");
    			var sectionView = sectionElement.attr("data-component-view");
    			if (!self.sections[sectionName]) {
    				self.sections[sectionName] = {};
    			}
    			sectionElement.removeAttr("key");
    			sectionElement.removeAttr("data-reactid");
    			self.sections[sectionName][sectionView] = sectionElement.detach();
    		});
        }
    
    	function fillProperties (context, element, data) {

    	    function fillElement (propertyElement) {
    			var propertyName = propertyElement.attr("data-component-prop");

                var value = data.get(propertyName);
    			if (typeof value === "undefined") {
    //				console.warn("Property '" + propertyName + "' not set for component: " + Context._implName);
    				data[propertyName] = "?";
    			}
    			
                for (var i = 0; i < propertyElement[0].attributes.length; ++i) {
                    var attr = propertyElement[0].attributes[i];
                    var re = /{{([^}]+)}}/g;
    				var m = null;
    				while (m = re.exec(attr.value)) {
    				    attr.value = attr.value.replace(m[0], data.get(m[1]));
    				}
                }

    			var target = propertyElement.attr("data-component-prop-target") || null;

    			if (!target &&
    			    propertyElement.prop("tagName") === "INPUT"
    			) {
    				propertyElement.val(value);
    			} else
    			if (
    			    !target ||
    			    target === "html"
    			) {
    				propertyElement.html(value);
    			} else {
    				var targetParts = target.split("/");
    				if (targetParts.length === 1) {
    					propertyElement.attr(targetParts[0], value);
    				} else
    				if (targetParts.length === 2 && targetParts[0] === "style") {
    					if (
    						targetParts[1] === "background-image" ||
    						/^https?:\/\//.test(value)
    					) {
    						propertyElement.css(targetParts[1], "url('" + value + "')");
    					} else {
    						propertyElement.css(targetParts[1], value);
    					}
    				} else {
    					throw new Error("Unsupported target '" + target + "'");
    				}
    			}
    	    }

            if (element.attr("data-component-prop")) {
    			fillElement(element);
            }
    		$('[data-component-prop]', element).each(function () {
    			fillElement($(this));
    		});
    	}

        jQueryTemplate.prototype.getComponentHelpers = function () {
    		var self = this;
            return {
                renderSection: function (context, element, name, data, getView, hookEvents) {
            		var sectionContainer = $('[data-component-section="' + name + '"]', self.domNode);
            
            		// TODO: Rather than resetting container, update changed rows only.
            		sectionContainer.empty();

            	    data.forEach(function (record) {
            
            	    	var view = getView(record);

            	    	if (!self.sections[name][view]) {
            	    		throw new Error("View '" + view + "' for section '" + name + "' not found!");
            	    	}

            			var elm = self.sections[name][view].clone();
            			elm.attr("key", record.key || record.id || getNextRandomKey());

            			fillProperties(context, elm, record);

            			elm = elm.appendTo(sectionContainer);
            
            			if (hookEvents) {
            				hookEvents(elm, record);
            			}
            	    });
            	},
            	fillProperties: fillProperties
            };
        }


        var VTreeTemplate = function (template) {
            var self = this;
            self.template = template;
            self.domNode = null;
        }

        VTreeTemplate.prototype.attachDomNode = function (domNode) {
            var self = this;
			self.domNode = domNode;
        }

        VTreeTemplate.prototype.render = function (controllingState) {
            var self = this;
            var chi = ch(controllingState);
            var vtree = self.template.buildVTree(h, chi);
            var elm = createElement(vtree);

            // TODO: Patch instead of replacing HTML.
            self.domNode.off();
            self.domNode.html("");
            $(elm).appendTo(self.domNode);

            return self.domNode;
        }

        return {
            jQueryTemplate: jQueryTemplate,
            VTreeTemplate: VTreeTemplate
        };
    }

    return exports;
}
