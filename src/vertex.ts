
import { Edge, EdgeCategory } from './edge';

export type Value = number | string | boolean
export type Operator = string

export enum VertexCategory {
    Data = 'Data',
    Control = 'Control',
    Compound = 'Compound'
}

export enum VertexKind {
    Literal = 'Literal',
    Symbol = 'Symbol',
    Parameter = 'Parameter',
    PrefixUnaryOperation = 'PrefixUnaryOperation',
    PostfixUnaryOperation = 'PostfixUnaryOperation',
    BinaryOperation = 'BinaryOperation',
    Phi = 'Phi',
    Start = 'Start',
    Pass = 'Pass',
    Return = 'Return',
    Branch = 'Branch',
    Merge = 'Merge',
    Allocation = 'Allocation',
    Store = 'Store',
    Load = 'Load',
    Call = 'Call',
}

export enum BinaryOperation {
    Add = '+',
    Sub = '-',
    Mul = '*',
    Div = '/',
    Assign = '=',
    LessThan = '<',
    GreaterThan = '>',
    LessThanEqual = '<=',
    GreaterThanEqual = '>=',
    EqualEqual = '==',
    NotEqual = '!=',
    EqualEqualEqual = '===',
    NotEqualEqual = '!==',
    And = '&&',
    Or = '||'
}

export enum UnaryOperation {
    Plus = '+',
    Minus = '-',
    Not = '!'
}

export abstract class Vertex {
    /*@internal*/
    private _id: number = -1;

    public get id(): number {
        return this._id;
    }
    /*@internal*/
    public set id(value: number) {
        this._id = value;
    }

    public abstract kind: VertexKind;
    public abstract category: VertexCategory;
    public abstract label: string;
    public abstract edges: Array<Edge>;
    public abstract verify(): boolean;
}

export interface DataVertex extends Vertex {
    category: VertexCategory.Data | VertexCategory.Compound;
}

export class LiteralVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Literal; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public value?: Value;

    constructor(value?: Value) {
        super();
        this.value = value;
    }

    public get label(): string {
        return String(this.value);
    }

    public get edges(): Array<Edge> {
        return [];
    }

    verify(): boolean {
        return this.value !== undefined;
    }
}

export class SymbolVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Symbol; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public name?: string;
    public startVertex?: StartVertex;

    constructor(name?: string, startVertex?: StartVertex) {
        super();
        this.name = name;
        this.startVertex = startVertex;
    }

    public get label(): string {
        return `#${this.name}`;
    }

    public get edges(): Array<Edge> {
        return [
            { source: this, target: this.startVertex, label: 'start', category: EdgeCategory.Association }
        ];
    }

    verify(): boolean {
        return this.name !== undefined && this.startVertex !== undefined;
    }
}

export class ParameterVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Parameter; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public position?: number;

    constructor(position?: number) {
        super();
        this.position = position;
    }

    public get label(): string {
        return `Parameter #${this.position}`;
    }

    public get edges(): Array<Edge> {
        return [];
    }

    verify(): boolean {
        return this.position !== undefined;
    }
}

export abstract class UnaryOperationVertex extends Vertex implements DataVertex {
    public abstract get kind(): VertexKind;
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public operator?: Operator;
    public operand?: DataVertex;

    constructor(operator?: Operator, operand?: DataVertex) {
        super();
        this.operator = operator;
        this.operand = operand;
    }

    public get edges(): Array<Edge> {
        return [
            { source: this, target: this.operand, label: 'operand', category: EdgeCategory.Data }
        ];
    }

    verify(): boolean {
        return this.operator !== undefined && this.operand !== undefined;
    }
}

export class PrefixUnaryOperationVertex extends UnaryOperationVertex {
    public get kind() { return VertexKind.PrefixUnaryOperation; }

    public get label(): string {
        return `${this.operator} (Prefix)`;
    }
}

export class PostfixUnaryOperationVertex extends UnaryOperationVertex {
    public get kind() { return VertexKind.PostfixUnaryOperation; }

    public get label(): string {
        return `${this.operator} (Postfix)`;
    }
}

export class BinaryOperationVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.BinaryOperation; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public operator?: Operator;
    public left?: DataVertex;
    public right?: DataVertex;

    constructor(operator?: Operator, left?: DataVertex, right?: DataVertex) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public get label(): string {
        return String(this.operator);
    }

    public get edges(): Array<Edge> {
        return [
            { source: this, target: this.left, label: 'left', category: EdgeCategory.Data },
            { source: this, target: this.right, label: 'right', category: EdgeCategory.Data }
        ];
    }

    verify(): boolean {
        return this.operator !== undefined && this.left !== undefined && this.right !== undefined;
    }
}

export type PhiOperand = {value: DataVertex, srcBranch: ControlVertex};

export class PhiVertex extends Vertex implements DataVertex {
    public get kind() { return VertexKind.Phi; }
    public get category(): VertexCategory.Data { return VertexCategory.Data; }

    public readonly operands: Array<PhiOperand>;
    public merge?: MergeVertex;

    constructor(operands?: Array<PhiOperand>, merge?: MergeVertex) {
        super();
        this.merge = merge;
        if (operands !== undefined) {
            this.operands = operands;
        }
        else {
            this.operands = [];
        }
    }

    public get label(): string {
        return 'Phi';
    }

    addOperand(operand: PhiOperand) {
        this.operands.push(operand);
    }

    public get edges(): Array<Edge> {
        const out: Array<Edge> = this.operands.map((operand) => {
            return { source: this, target: operand.value, label: String(operand.srcBranch.id), category: EdgeCategory.Data }
        });
        out.push({ source: this, target: this.merge, label: 'merge', category: EdgeCategory.Association });
        return out;
    }

    verify(): boolean {
        return this.merge !== undefined && this.operands.length > 1;
    }
}

export abstract class ControlVertex extends Vertex {
    get category(): VertexCategory.Control | VertexCategory.Compound { return VertexCategory.Control; }
    get label(): string { return this.kind; }
}

export abstract class NonTerminalControlVertex extends ControlVertex {
    public abstract get kind(): VertexKind;

    public next?: ControlVertex;

    constructor(next?: ControlVertex) {
        super();
        this.next = next;
    }

    public get edges(): Array<Edge> {
        return [
            { source: this, target: this.next, label: 'next', category: EdgeCategory.Control}
        ]
    }

    verify(): boolean {
        return this.next !== undefined;
    }
}

export class StartVertex extends NonTerminalControlVertex {
    public get kind() { return VertexKind.Start; }
}

export class PassVertex extends NonTerminalControlVertex {
    public get kind() { return VertexKind.Pass; }
}

export class ReturnVertex extends ControlVertex {
    public get kind() { return VertexKind.Return; }

    public value?: DataVertex;

    constructor(value?: DataVertex) {
        super();
        this.value = value;
    }

    public get edges(): Array<Edge> {
        return this.value === undefined ? [] : [
            { source: this, target: this.value, label: 'value', category: EdgeCategory.Data }
        ];
    }

    verify(): boolean {
        return true;
    }
}

export class BranchVertex extends ControlVertex {
    public get kind() { return VertexKind.Branch; }

    public condition?: DataVertex;
    public trueNext?: ControlVertex;
    public falseNext?: ControlVertex;

    constructor(condition?: DataVertex, trueNext?: ControlVertex, falseNext?: ControlVertex) {
        super();
        this.condition = condition;
        this.trueNext = trueNext;
        this.falseNext = falseNext;
    }

    public get edges(): Array<Edge> {
        return [
            { source: this, target: this.condition, label: 'condition', category: EdgeCategory.Data },
            { source: this, target: this.trueNext, label: 'true', category: EdgeCategory.Control },
            { source: this, target: this.falseNext, label: 'false', category: EdgeCategory.Control }
        ];
    }

    verify(): boolean {
        return this.condition !== undefined && this.trueNext !== undefined && this.falseNext !== undefined;
    }
}

export class MergeVertex extends NonTerminalControlVertex { // ? should add corresponding branch?
    public get kind() { return VertexKind.Merge; }
}

export class AllocationVertex extends PassVertex implements DataVertex {
    public get kind() { return VertexKind.Allocation; }
    public get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    public objectType?: string;
    public constructorSymbol?: SymbolVertex;

    constructor(objectType?: string, constructorSymbol?: SymbolVertex, next?: ControlVertex) {
        super(next);
        this.objectType = objectType;
        this.constructorSymbol = constructorSymbol;
    }

    public get edges(): Array<Edge> {
        const out = super.edges;
        out.push({ source: this, target: this.constructorSymbol, label: 'constructor', category: EdgeCategory.Data });
        return out;
    }

    verify(): boolean {
        return this.objectType !== undefined && this.constructorSymbol !== undefined && super.verify();
    }
}

export class StoreVertex extends PassVertex {
    public get kind() { return VertexKind.Store; }

    public object?: DataVertex;
    public property?: DataVertex;
    public value?: DataVertex;

    constructor(object?: DataVertex, property?: DataVertex, value?: DataVertex, next?: ControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
        this.value = value;
    }

    public get edges(): Array<Edge> {
        const out = super.edges;
        out.push(
            { source: this, target: this.object, label: 'object', category: EdgeCategory.Data },
            { source: this, target: this.property, label: 'property', category: EdgeCategory.Data },
            { source: this, target: this.value, label: 'value', category: EdgeCategory.Data }
        );
        return out;
    }

    verify(): boolean {
        return this.object !== undefined && this.property !== undefined && this.value !== undefined && super.verify();
    }
}

export class LoadVertex extends PassVertex implements DataVertex {
    public get kind() { return VertexKind.Load; }
    public get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    public object?: DataVertex;
    public property?: DataVertex;

    constructor(object?: DataVertex, property?: DataVertex, next?: ControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
    }

    public get edges(): Array<Edge> {
        const out = super.edges;
        out.push(
            { source: this, target: this.object, label: 'object', category: EdgeCategory.Data },
            { source: this, target: this.property, label: 'property', category: EdgeCategory.Data }
        );
        return out;
    }

    verify(): boolean {
        return this.object !== undefined && this.property !== undefined && super.verify();
    }
}

export class CallVertex extends PassVertex implements DataVertex {
    public get kind() { return VertexKind.Call; }
    public get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    public callee?: DataVertex;
    public args?: Array<DataVertex>;
    public callerObject?: DataVertex;

    constructor(callee?: DataVertex, args?: Array<DataVertex>, callerObject?: DataVertex, next?: ControlVertex) {
        super(next);
        this.callee = callee;
        this.args = args;
        this.callerObject = callerObject;
    }

    public get edges(): Array<Edge> {
        const out = super.edges;
        out.push({ source: this, target: this.callee, label: 'callee', category: EdgeCategory.Data })
        if (this.args !== undefined) {
            this.args.forEach((arg, i) => {
                out.push({ source: this, target: arg, label: String(i), category: EdgeCategory.Data });
            });
        }
        if (this.callerObject !== undefined) {
            out.push({ source: this, target: this.callerObject, label: 'object', category: EdgeCategory.Data });
        }
        return out;
    }

    verify(): boolean {
        return this.callee !== undefined && this.args !== undefined && super.verify();
    }
}
