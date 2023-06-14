"use client"
import { useEffect, useState } from 'react';
import { GraphCanvas } from 'reagraph';


class Node {
  constructor(id) {
    this.id = id;
    this.label = `[${id}] `;
  }
}
class Edge {
  constructor(source, target, id, label) {
    this.source = source;
    this.target = target;
    this.id = id;
    this.label = label;
  }
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Adjacency {
  constructor(node, weight, id) {
    this.node = node;
    this.weight = weight;
    this.id = id;
  }
}
const weights = [1, 0, -1];

function createRandomGraph(n) {
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  const adj = {};
  let nodes = [];
  for (let i = 0; i < n; i++) {
    nodes.push(new Node(letters[i], ''));
    adj[letters[i]] = [];
  }
  for (let i = 0; i < n; i++) {
    const tmpNodes = nodes.filter(n => n.id != letters[i]).sort(() => Math.random() - 0.5);
    const numEdges = randomInt(2, n > 4 ? n : 4);
    for (let j = 0; j < numEdges; j++) {
      const weight = weights[randomInt(0, weights.length - 1)];
      if (!tmpNodes[j]) break;
      adj[tmpNodes[j].id].push(new Adjacency(nodes[i], weight, tmpNodes[j].id + "-" + nodes[i].id));
    }
  }
  return [adj, nodes];
}

function depthFirstTraversal(currentNode, age, nodes, adj, visited = []) {

  // console.log(currentNode, age);

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

function cleanNodes(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].label = `[${nodes[i].id}] `;
  }
}

function handleClickNode(setStartAge, startAge, nodes) {
  cleanNodes(nodes);
  setStartAge(Math.max((startAge + 1) % 4, 1));
}


let adj = null
let nodes = null;

export default function Home() {
  const [rg_nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startAge, setStartAge] = useState(1);

  useEffect(() => {
    [adj, nodes] = createRandomGraph(6);
    depthFirstTraversal("A", startAge, nodes, adj);
    setNodes(nodes);
    setEdges(convertToReaGraphEdges(adj));
  }, []);

  useEffect(() => {
    cleanNodes(nodes);
    depthFirstTraversal("A", startAge, nodes, adj);
    setNodes(nodes);
    setEdges(convertToReaGraphEdges(adj));
  }, [startAge]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GraphCanvas labelType="all" layoutType='forceDirected2d' draggable edgeInterpolation="curved"
        nodes={rg_nodes} edges={edges} onEdgeClick={edge => alert(`Weight: ${edge.label}`)} onNodeClick={() => handleClickNode(setStartAge, startAge, nodes)} />
    </main>
  )
}
