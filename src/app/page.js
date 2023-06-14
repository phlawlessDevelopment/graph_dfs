"use client"
import { useEffect, useState, useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from 'reagraph';

class Edge {
  constructor(source, target, id, label) {
    this.source = source;
    this.target = target;
    this.id = id;
    this.label = label;
  }
}

class Adjacency {
  constructor(node, weight, id) {
    this.node = node;
    this.weight = weight;
    this.id = id;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Node {
  constructor(id) {
    this.id = id;
    this.label = `[${id}] `;
  }
}
const weights = [1, 0, -1];

function createRandomGraph(n) {
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  const adj = {};
  let nodes = [];
  // Create n nodes
  for (let i = 0; i < n; i++) {
    nodes.push(new Node(letters[i], ''));
    adj[letters[i]] = [];
  }
  // Shuffle the nodes array using Fisher-Yates shuffle
  for (let i = nodes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
  }
  // assign edges in a circle
  for (let i = 0; i < n; i++) {
    const fromNode = nodes[i];
    const toNode = nodes[(i + 1) % n];
    const weight = weights[randomInt(0, weights.length - 1)];
    adj[toNode.id].push(new Adjacency(fromNode, weight, toNode.id + "-" + fromNode.id));
    adj[fromNode.id].push(new Adjacency(toNode, weight * -1, fromNode.id + "-" + toNode.id));
  }
  extraEdges(n, nodes, adj);
  return [adj, nodes];
}

function extraEdges(n, nodes, adj) {

  const weight = weights[randomInt(0, weights.length - 1)];
  if (n % 3 === 0) {
    n = Math.round(n / 3)
    for (let i = 0; i < n; i++) {
      const start = (i * n) % nodes.length;
      const startNode = nodes[start];
      const endNode = nodes[(start + 3) % nodes.length];
      const weight = weights[randomInt(0, weights.length - 1)];
      adj[startNode.id].push(new Adjacency(startNode, weight, endNode.id + "-" + startNode.id));
      adj[startNode.id].push(new Adjacency(endNode, weight, startNode.id + "-" + endNode.id));
    }
  }
  else if (n % 5 === 0) {
    // get the 4 nodes in a row in the array, assuming it's a ring 
    const start = 0;
    const startNode = nodes[start];

  }
}



function depthFirstTraversal(currentNode, age, nodes, adj, visited = []) {
  const adjacencies = adj[currentNode];
  const node = nodes.find(n => n.id == currentNode);
  node.label += age.toString() + ",";
  if (!adjacencies)
    return;

  for (let i = 0; i < adjacencies.length; i++) {
    const adjacency = adjacencies[i];
    const nextAge = age + Number(adjacency.weight);

    if (nextAge > 3 || nextAge < 1)
      continue;

    const visitedTuple = JSON.stringify([adjacency.id, age]);
    if (visited.includes(visitedTuple))
      continue;

    visited.push(visitedTuple);
    depthFirstTraversal(adjacency.node.id, nextAge, nodes, adj, visited);
  }
}

function convertToReaGraphEdges(adj) {
  const edges = [];
  for (const key in adj) {
    if (adj.hasOwnProperty(key)) {
      const element = adj[key];
      for (const a of element) {

        edges.push(new Edge(
          key,
          a.node.id,
          key + "-" + a.node.id,
          a.weight.toString()
        ))
      }
    }

  }
  return edges;
}

function dedupeNodeLabels(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].label = [...new Set(nodes[i].label.replaceAll(',', ' ').split(' '))].join(',');
  }
}

function cleanNodes(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].label = `[${nodes[i].id}] `;
  }
}

function handleClickNode(node, startNode, setStartNode, setStartAge, startAge, nodes) {
  if (node.id !== startNode) {
    setStartNode(node.id);
  } else {
    setStartAge(Math.max((startAge + 1) % 4, 1));
  }
  cleanNodes(nodes);
}


let adj = null
let nodes = null;

export default function Home() {
  const [rg_nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startAge, setStartAge] = useState(1);
  const [startNode, setStartNode] = useState("A");

  useEffect(() => {
    [adj, nodes] = createRandomGraph(5);
    depthFirstTraversal(startNode, startAge, nodes, adj);
    dedupeNodeLabels(nodes);
    setNodes(nodes);
    setEdges(convertToReaGraphEdges(adj));
  }, []);

  useEffect(() => {
    depthFirstTraversal(startNode, startAge, nodes, adj);
    dedupeNodeLabels(nodes);
    setNodes(nodes);
    setEdges(convertToReaGraphEdges(adj));
  }, [startAge, startNode]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GraphCanvas labelType="all" layoutType='forceDirected2d'
        nodes={rg_nodes} edges={edges}
        draggable
        onEdgeClick={edge => alert(`Weight: ${edge.label}`)}
        onNodeClick={(n) => handleClickNode(n, startNode, setStartNode, setStartAge, startAge, nodes)}
      />
    </main>
  )
}
