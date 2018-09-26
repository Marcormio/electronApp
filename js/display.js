const $ = require('jquery');
const mt = require('./js/megatree');
const cytoscape = require('cytoscape');
const dagre_layout = require('dagre-layout');
const dragre_dagre = require('dagre');
const dagre_cyto = require('cytoscape-dagre');

const fs = require("fs");
const {dialog} = require('electron').remote;

var cyCanvas;

var canvas = {
	container: document.getElementById('display-container'),

	boxSelectionEnabled: true,
	autounselectify: false,
	selectionType: 'single',

	layout: {
		name: 'dagre'
	},

	style: [
		{
			selector: 'node',
			style: {
				'content': 'data(label)',
				'text-opacity': 0.5,
				'text-valign': 'center',
				'text-halign': 'center',
				'background-color': '#DCC6C6'
			}
		},
		{
			selector: '.terminal',
			style: {
			  'shape': 'roundrectangle'
			}
		},
		{
			selector: 'node:selected',
			style: {
				'content': 'data(label)',
				'text-opacity': 0.5,
				'text-valign': 'center',
				'text-halign': 'center',
				'background-color': '#b2ff4f'
			}
		},
			{
				selector: '.enumNode',
				style: {
					'background-color': '#ff6773'
				}
			},

		{
			selector: 'edge',
			style: {
				'curve-style': 'bezier',
				'width': 4,
				'target-arrow-shape': 'triangle',
				'line-color': '#4C3F3F',
				'target-arrow-color': '#4C3F3F'
			}
		},
		{
			selector: '.enumEdge',
			style: {
				'line-color': '#ff6773',
				'target-arrow-color': '#ff6773'
			}
		}
	],

	elements: {
		nodes: [],
		edges: []
	},
};

var inputTrees = [];
var canvasInputMaxId = 0;

var canvasMT;

$('#btn-plus').click(function() {
	// Open DIALOG file
	var selected_files = dialog.showOpenDialog(
	{properties: ['openFile', 'multiSelections']}
	);

	// Build TREES from files
	for (var i = 0; i < selected_files.length; i++) {
		// Load files
		var data = fs.readFileSync(selected_files[i]).toString();
		var lines = data.split('\n');

		//Build EDGELIST
		var edgelist = [];
		for (var i = 0; i < lines.length; i++) {
			var x = lines[i].split('->');
			var edge = [];
			x[0] = $.trim(x[0]);
			x[1] = $.trim(x[1]);
			if (x[0] && x[1]) {
				edge.push(x[0]);
				edge.push(x[1]);
				edgelist.push(edge);
			}
		}

	// Build TREE from edgelist
	var intree = mt.edgelistToMT(edgelist, canvasInputMaxId);
	canvasInputMaxId = intree.nodesNid + 1;
	inputTrees.push(intree);

	//TODO: Change it to DAG
	// for (var i = 0; i < intree.nodesCyto.length; i++) {
	//   canvas.elements.nodes.push(intree.nodesCyto[i]);
	// }
	//
	// for (var i = 0; i < intree.edgesCyto.length; i++) {
	//   if (intree.edgesCyto[i].data.source != intree.megaroot.id) {
	//     canvas.elements.edges.push(intree.edgesCyto[i]);
	//   }
	// }
	
	}

  //TODO: Change it to DAG

	var ret = mt.build_test_MT();
	var test_mt = ret[0];
	var terminalNodes = ret[1];

	for (var i = 0; i < test_mt.nodesCyto.length; i++) {
	  canvas.elements.nodes.push(test_mt.nodesCyto[i]);
	}

	for (var i = 0; i < test_mt.edgesCyto.length; i++) {
	  if (test_mt.edgesCyto[i].data.source != test_mt.megaroot.id) {
		canvas.elements.edges.push(test_mt.edgesCyto[i]);
	  }
	}

	document.getElementById('display-container').innerHTML = '';

	cyCanvas = cytoscape(
		canvas
	);

	for (var j = 0; j < terminalNodes.length; j++){
		var x = cyCanvas.filter('node#' + terminalNodes[j]);
		x.toggleClass('terminal', true);
	}

});

$('#tab-mt').click(function() {
	document.getElementById('tab-inp').classList.remove("active");
	document.getElementById('tab-mt').classList.add("active");

	var display_input =  document.getElementById('display-container');
	display_input.style.display = 'none';

	var display_mt = document.getElementById('display-mt');
	display_mt.style.display = 'block';
});

$('#tab-inp').click(function() {
	document.getElementById('tab-inp').classList.add("active");
	document.getElementById('tab-mt').classList.remove("active");

	var display_mt =  document.getElementById('display-mt');
	display_mt.style.display = 'none';

	var display_input =  document.getElementById('display-container');
	display_input.style.display = 'block';
});

$('#btn-build').click(function () {
	console.log('Surprise! I don\'t work. lol');
	if (cyCanvas) {
		var selectedNodes = cyCanvas.$('node:selected'); // query the graph for selected nodes
		console.log(selectedNodes);
	}
});

// ENUMERATE menu
var currentEnumerate = 0;
var maxEnumeration = -1;
var enumerationData = null;

var toggleNodes = function (nodes, tf) {
	for (var j = 0; j < nodes.length; j++){
		var x = cyCanvas.filter('node#' + nodes[j]);
		x.toggleClass('enumNode', tf);
	}
};
var toggleEdges = function (edges, tf) {
	for (var j = 0; j < edges.length; j++){
		var edge = edges[j];
		var x = cyCanvas.filter('#' + edge[0] + ' -> #' + edge[1]);
		x.toggleClass('enumEdge', tf);
	}
};


$('#btn-enumerate').click(function () {
	var enum_toolbar = document.getElementById('enumerate-toolbar');
	enum_toolbar.style.display = 'block';

	//TODO: start enumeratation
	var enumeration = mt.enumerateMT(0);

	enumerationData = enumeration;


	var nodes = enumeration[0].nodes;
	toggleNodes(nodes, true);
	var edges = enumeration[0].edges;
	toggleEdges(edges, true);

	maxEnumeration = enumeration.length - 1;
});


$('#btn-enum-next').click(function () {
	if (currentEnumerate === maxEnumeration) {
		return;
	}
	// unselect current enumeration
	var nodes = enumerationData[currentEnumerate].nodes;
	toggleNodes(nodes, false);
	var edges = enumerationData[currentEnumerate].edges;
	toggleEdges(edges, false);

	currentEnumerate++;
	nodes = enumerationData[currentEnumerate].nodes;
	toggleNodes(nodes, true);
	var edges = enumerationData[currentEnumerate].edges;
	toggleEdges(edges, true);
});

$('#btn-enum-prev').click(function () {
	if (currentEnumerate === 0) {
		return;
	}
	// unselect current enumeration
	var nodes = enumerationData[currentEnumerate].nodes;
	toggleNodes(nodes, false);
	var edges = enumerationData[currentEnumerate].edges;
	toggleEdges(edges, false);

	currentEnumerate--;
	nodes = enumerationData[currentEnumerate].nodes;
	toggleNodes(nodes, true);
	var edges = enumerationData[currentEnumerate].edges;
	toggleEdges(edges, true);
});

$('#btn-enum-close').click(function () {
	var enum_toolbar = document.getElementById('enumerate-toolbar');
	enum_toolbar.style.display = 'none';

	//TODO: end enumerate

	// unselect current enumeration
	var nodes = enumerationData[currentEnumerate].nodes;
	toggleNodes(nodes, false);
	var edges = enumerationData[currentEnumerate].edges;
	toggleEdges(edges, false);

	// reset enumeration data
	currentEnumerate = 0;
	maxEnumeration = -1;
	enumerationData = null;
});