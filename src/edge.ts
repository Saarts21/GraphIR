
import { ControlVertex, Vertex } from './vertex';


export enum EdgeCategory {
    Data = 'Data',
    Control = 'Control',
    Association = 'Association',
}

export class Edge {
    private _source: Vertex;
    private _target?: Vertex;
    private _label: string;
    public category: EdgeCategory;

    constructor(source: Vertex, target: Vertex | undefined, label: string, category: EdgeCategory) {
        this._source = source;
        this.target = target;
        this._label = label;
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

    public get label(): string {
        return this._label;
    }

    public set label(label: string) {
        this._label = label;
    }
}

export class PhiEdge extends Edge {
    public readonly srcBranch: ControlVertex;

    constructor(source: Vertex, target: Vertex | undefined, srcBranch: ControlVertex, category: EdgeCategory) {
        super(source, target, '', category);
        this.srcBranch = srcBranch;
    }

    public get label(): string {
        return String(this.srcBranch?.id);
    }
}
