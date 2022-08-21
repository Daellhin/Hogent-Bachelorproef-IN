import { JsonGraph } from 'ngraph.fromjson';
import createGraph, { Graph, Node } from 'ngraph.graph';
import { aStar } from 'ngraph.path';
import { capitalizeFirstLetter } from './javasciptUtils';

export function createPathFinder(graph: Graph) {
    return aStar(graph, {
        distance(fromNode, toNode, link) {
            return Math.hypot(toNode.data.x - fromNode.data.x, toNode.data.y - fromNode.data.y);
        },
        heuristic(fromNode, toNode) {
            return Math.hypot(toNode.data.x - fromNode.data.x, toNode.data.y - fromNode.data.y);
        }
    });
}

// use this function to create a graph from the output of a pathfingin algorithm
export function createGraphFromPathNodes(nodes: Node[]) {
    const graph = createGraph();
    for (let index = nodes.length - 1; index >= 0; index--) {
        const node = nodes[index];
        graph.addNode(node.id, node.data);

        if (index > 0) {
            const nextNode = nodes[index - 1];
            graph.addLink(node.id, nextNode.id);
        }
    }
    return graph;
}

/**
 * Return all graph nodes that are navigable (this means they have a meaningfull id)
 * TODO rework to use labels i.p.o string ids
 */
export function createNavigableOptions(jsonGraph: JsonGraph) {
    return jsonGraph.nodes
        .filter((node) => !Number.isInteger(node.id))
        .map((node) => {
            return {
                label: capitalizeFirstLetter((node.id as string).replace(/_/g, ' ')),
                value: node.id
            };
        });
}

/**
 * Return all graph nodes that are navigable (this means they have a meaningfull id)
 * TODO rework to use labels i.p.o string ids
 */
export function createNavigableNodes(nodes: Node[]) {
    return nodes
        .filter((node) => !Number.isInteger(node.id))
        .map((node) => {
            return {
                id: capitalizeFirstLetter((node.id as string).replace(/_/g, ' ')),
                data: node.data

            } as Node;
        });
}
