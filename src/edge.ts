
import { Vertex } from './vertex';


export enum EdgeCategory {
    Data = 'Data',
    Control = 'Control',
    Association = 'Association',
}

export interface Edge {
    source?: Vertex;
    target?: Vertex;
    label: string;
    category: EdgeCategory;
}
