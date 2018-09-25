"use strict";

var Node = class Node {
  constructor(label) {
    this.label = label;
    this.children = [];
    this.parents = [];
    this.id = -1;
    this.terminal = false;
  }

  get childrenSet() {
    var setchildren = new Set();
    for (var child in children) {
      setchildren.add(child.name);
    }
  }

  addChild(node) {
    this.children.push(node);
  }

  addParent(node) {
    this.parents.push(node);
  }

};

var MegaTree = class MegaTree {
  constructor(node_root, startNID = 0) {
    this.nodesNid = startNID;

    this.nodeNames = {};

    // Vis
    this.nodesCyto = [];
    this.edgesCyto = [];

    // megaroot
    var megaroot = new Node('megaroot');
    megaroot.id = startNID;
    this.megaroot = megaroot;
    this.addNode(node_root);
    this.addEdge(this.megaroot, node_root)
  }

  addNode(node) {
    this.nodesNid++;
    node.id = this.nodesNid;

    if (!(node.label in this.nodeNames)) {
      this.nodeNames[node.label] = [];
      this.nodeNames[node.label].push(node);
    } else {
      this.nodeNames[node.label].push(node);
    }

    // for visualisation purposes:
    this.nodesCyto.push({
      data: {
        id: node.id,
        label: node.label
      }
    });
  }

  addEdge(from, to) {
    from.addChild(to);
    to.addParent(from);

    // for visualisation purposes:
    this.edgesCyto.push({
      data: {
        source: from.id,
        target: to.id
      }
    });

  }

  getNodeByName(name) {
    return this.nodeNames[name];
  }
};

var edgelistToMT = function edgelistToMT(data, offset=0) {
  var root = new Node('germline');
  var megatree = new MegaTree(root, offset);

  // console.log(data);
  for (var i = 0; i < data.length; i++) {
    var f = data[i][0],
        t = data[i][1];

    var x = megatree.getNodeByName(f);
    if (x == null) {
      x = new Node(t);
      megatree.addNode(x);
    } else {
      x = x[0];
    }

    var y = megatree.getNodeByName(t);
    if (y == null) {
      y = new Node(t);
      megatree.addNode(y);
    } else {
      y= y[0];
    }

    megatree.addEdge(x, y);
  }

  return megatree;
};

var build_test_MT = function () {
    var mt_test = [['germline', 'A'],
        ['A', 'B'],
        ['B', 'D'],
        ['D', 'E'],
        ['B', 'C'],
        ['C', 'F'],
        ['A', 'G'],
        ['G', 'E'],
        ['F', 'G']];

    var mt = edgelistToMT(mt_test, 0);

    var dupD = new Node('D');
    var dupF = new Node('F');
    mt.addNode(dupD);
    mt.addNode(dupF);

    var nodeB = mt.getNodeByName('B')[0];

    mt.addEdge(nodeB, dupD);
    mt.addEdge(dupD, dupF);

    var dupC = new Node('C');
    mt.addNode(dupC);

    mt.addEdge(nodeB, dupC);
    mt.addEdge(dupC, mt.getNodeByName('E')[0]);

    return [mt, [10,6,5,8]];
};

var enumerate_test = function() {
    var mt = build_test_MT();

    var enumeration  = [];

    var tree1 = {
        nodes: [1,2,3,4,5,6,7,8],
        edges: [[1,2],[2,3],[3,4],[3,6],[4,5],[6,7],[7,8]]
    };

    var tree2 = {
        nodes: [1,2,3,8,11,5,9,10],
        edges: [[1,2],[2,3],[2,8],[3,9],[9,10],[3,11],[11,5]]
    };

    var tree3 = {
        nodes: [1,2,3,9,10,6,8,5],
        edges: [[1,2],[2,3],[3,6],[2,8],[8,5],[3,9],[9,10]]
    };

    enumeration.push(tree1);
    enumeration.push(tree2);
    enumeration.push(tree3);

    return enumeration;
};

var addInputTreeToMT = function (inputTree, MT) {
    //TODO: use actual definition
};

var enumerateMT = function (megatree) {
    //TODO: use actual definition

    return enumerate_test();
};


module.exports.Node = Node;
module.exports.edgelistToMT = edgelistToMT;
module.exports.MegaTree = MegaTree;
module.exports.enumerateMT = enumerateMT;
module.exports.addInputTreeToMT = addInputTreeToMT;

module.exports.build_test_MT = build_test_MT;
