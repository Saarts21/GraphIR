
import { Vertex } from './vertex';


export enum EdgeCategory {
    Data = 'Data',
    Control = 'Control',
    Association = 'Association',
}

export class Edge {
    private _source: Vertex;
    private _target?: Vertex;
    public label: string;
    public category: EdgeCategory;

    constructor(source: Vertex, target: Vertex | undefined, label: string, category: EdgeCategory) {
        this._source = source;
        this.target = target;
        this.label = label;
        this.category = category;
    }

    public get source(): Vertex {
        return this._source;
    }

    public get target(): Vertex | undefined {
        return this._target;
    }

    public set target(target: Vertex | undefined) {
        if (this._target) {
            this._target._inEdges = this._target._inEdges.filter(e => e !== this);
        }

        this._target = target;
        if (target) {
            target._inEdges.push(this);
        }
    }
}
