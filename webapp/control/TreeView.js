sap.ui.define([
		"sap/m/Button",
		"sap/m/ToggleButton",
		"sap/ui/core/Control"
	],
	function(Button, ToggleButton, Control) {
		"use strict";
		return Control.extend("com.d3.demo.control.TreeView", {
			oSelectedStepData: null,
			metadata: {
				properties: {

					data: {
						type: "object",
						defaultValue: []
					}
				},
				events: {
					nodeClick: {
						enablePreventDefault: true
					},
					nodeDblClick: {
						enablePreventDefault: true
					}
				}
			},
			init: function() {
				// Set the dimensions and margins of the diagram
				this.margin = {
					top: 20,
					right: 90,
					bottom: 30,
					left: 90
				};
				this.width = 960 - this.margin.left - this.margin.right;
				this.height = 500 - this.margin.top - this.margin.bottom;
				this.i = 0;
				this.duration = 750;
				this.root = null;

			},

			renderer: function(oRM, oControl) {
				oRM.write("<div");
				oRM.writeControlData(oControl);
				// oRM.write("style='overflow: hidden;height: 100%;width: 100%'");
				oRM.write(">");
				oRM.write("</div>");
			},
			onAfterRendering: function(oControl) {
				var treeData = this.getData();
				if (jQuery.isEmptyObject(treeData)) {
					return;
				}
				var container = oControl.srcControl.getDomRef();
				// append the svg object to the body of the page
				// appends a 'group' element to 'svg'
				// moves the 'group' element to the top left margin
				this.svg = d3.select(container).append("svg")
					.attr("width", this.width + this.margin.right + this.margin.left)
					.attr("height", this.height + this.margin.top + this.margin.bottom)
					.append("g")
					.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

				// declares a tree layout and assigns the size
				this.treemap = d3.tree().size([this.height, this.width]);
				// Assigns parent, children, height, depth
				this.root = d3.hierarchy(treeData, function(d) {
					return d.children;
				});
				this.root.x0 = this.height / 2;
				this.root.y0 = 0;
				// Collapse after the second level
				this.root.children.forEach(this.collapse.bind(this));
				this.update(this.root);
			},
			// Collapse after the second level
			collapse: function(d) {
				if (d.children) {
					d._children = d.children;
					d._children.forEach(this.collapse.bind(this));
					d.children = null;
				}
			},
			update: function(source) {
				var treeData = this.treemap(this.root);
				// Compute the new tree layout.
				var nodes = treeData.descendants();
				var links = treeData.descendants().slice(1);

				// Normalize for fixed-depth.
				nodes.forEach(function(d) {
					d.y = d.depth * 180;
				});
				this._createNodes(nodes, source);
				this._createLinks(nodes, source, links);
				// Store the old positions for transition.
				nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
				});
			},
			_createNodes: function(nodes, source) {
				// ****************** Nodes section ***************************
				// Update the nodes...
				var node = this.svg.selectAll('g.node')
					.data(nodes, function(d) {
						return d.id || (d.id = ++this.i);
					}.bind(this));

				// Enter any new modes at the parent's previous position.
				var nodeEnter = node.enter().append('g')
					.attr('class', 'node')
					.attr("transform", function(d) {
						return "translate(" + source.y0 + "," + source.x0 + ")";
					})
					.on('click', this.onNodeClick.bind(this));

				// Add Circle for the nodes
				nodeEnter.append('circle')
					.attr('class', 'node')
					.attr('r', 1e-6)
					.style("fill", function(d) {
						return d._children ? "lightsteelblue" : "#fff";
					});

				// Add labels for the nodes
				nodeEnter.append('text')
					.attr("dy", ".35em")
					.attr("x", function(d) {
						return d.children || d._children ? -13 : 13;
					})
					.attr("text-anchor", function(d) {
						return d.children || d._children ? "end" : "start";
					})
					.text(function(d) {
						return d.data.name;
					});

				// UPDATE
				var that = this;
				var nodeUpdate = nodeEnter.merge(node);

				// Transition to the proper position for the node
				nodeUpdate.transition()
					.duration(that.duration)
					.attr("transform", function(d) {
						return "translate(" + d.y + "," + d.x + ")";
					});

				// Update the node attributes and style
				nodeUpdate.select('circle.node')
					.attr('r', 10)
					.style("fill", function(d) {
						return d._children ? "lightsteelblue" : "#fff";
					})
					.attr('cursor', 'pointer');

				// Remove any exiting nodes
				var nodeExit = node.exit().transition()
					.duration(that.duration)
					.attr("transform", function(d) {
						return "translate(" + source.y + "," + source.x + ")";
					})
					.remove();

				// On exit reduce the node circles size to 0
				nodeExit.select('circle')
					.attr('r', 1e-6);

				// On exit reduce the opacity of text labels
				nodeExit.select('text')
					.style('fill-opacity', 1e-6);
			},
			_createLinks: function(nodes, source, links) {
				var that = this;
				var diagonal = function(s, d) {
					var path = "M " + (s.y) + " " + s.x + " C " + (s.y + d.y) / 2 + " " + s.x + " , " + (s.y + d.y) / 2 + " " + d.x + "," + d.y +
						" " + d.x;

					return path;
				};
				// Update the links...
				var link = this.svg.selectAll('path.link')
					.data(links, function(d) {
						return d.id;
					});

				// Enter any new links at the parent's previous position.
				var linkEnter = link.enter().insert('path', "g")
					.attr("class", "link")
					.attr('d', function(d) {
						var o = {
							x: source.x0,
							y: source.y0
						};
						return diagonal(o, o);
					});

				// UPDATE
				var linkUpdate = linkEnter.merge(link);

				// Transition back to the parent element position
				linkUpdate.transition()
					.duration(that.duration)
					.attr('d', function(d) {
						return diagonal(d, d.parent);
					});

				// Remove any exiting links
				var linkExit = link.exit().transition()
					.duration(that.duration)
					.attr('d', function(d) {
						var o = {
							x: source.x,
							y: source.y
						};
						return diagonal(o, o);
					})
					.remove();
			},
			onNodeClick: function(d) {
				if (d.children) {
					d._children = d.children;
					d.children = null;
				} else {
					d.children = d._children;
					d._children = null;
				}
				this.update(d);
				this.fireEvent("nodeClick", {
					data: d.data
				});

			},

			_onNodeDblClick: function(evt) {

			},
			exit: function() {

			}
		});
	});