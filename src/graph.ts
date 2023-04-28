
import { Vertex, StartVertex } from './vertex';

export class Graph {
    public readonly vertices: Array<Vertex> = [];
    private startVertex?: StartVertex;
    public readonly subgraphs: Array<Graph> = [];

    constructor(vertices?: Array<Vertex>, startVertex?: StartVertex, subgraphs?: Array<Graph>) {
        if (vertices !== undefined) {
            this.vertices = vertices;
        }

        if (startVertex !== undefined) {
            this.startVertex = startVertex;
        }

        if (subgraphs !== undefined) {
            this.subgraphs = subgraphs;
        }
    }

    public addVertex(vertex: Vertex): void {
        this.vertices.push(vertex); //TODO: check if vertex already exists
    }

    public addSubgraph(subgraph: Graph): void {
        this.subgraphs.push(subgraph); //TODO: check for cycles
    }

    public setStartVertex(vertex: StartVertex): void {
        this.startVertex = vertex;
        this.addVertex(vertex);
    }

    public verify(): boolean {
        if (this.startVertex === undefined) {
            return false;
        }

        for (const vertex of this.vertices) {
            if (!vertex.verify()) {
                return false;
            }
        }

        for (const subgraph of this.subgraphs) {
            if (!subgraph.verify()) {
                return false;
            }
        }

        return true;
    }
}

export * from './vertex';
