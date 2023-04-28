
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
    End = 'End',
    Return = 'Return',
    Branch = 'Branch',
    Merge = 'Merge',
    Allocation = 'Allocation',
    Store = 'Store',
    Load = 'Load',
    Call = 'Call',
}

export interface Vertex {
    kind: VertexKind;
    category: VertexCategory;
    verify(): boolean;
}

export interface DataVertex extends Vertex {
    category: VertexCategory.Data | VertexCategory.Compound;
}

export class LiteralVertex implements DataVertex {
    get kind() { return VertexKind.Literal; }
    get category(): VertexCategory.Data { return VertexCategory.Data; }

    public value?: Value;

    constructor(value?: Value) {
        this.value = value;
    }

    verify(): boolean {
        return this.value !== undefined;
    }
}

export class SymbolVertex implements DataVertex {
    get kind() { return VertexKind.Symbol; }
    get category(): VertexCategory.Data { return VertexCategory.Data; }

    public name?: string;
    public startVertex?: StartVertex;

    constructor(name?: string, startVertex?: StartVertex) {
        this.name = name;
        this.startVertex = startVertex;
    }

    verify(): boolean {
        return this.name !== undefined && this.startVertex !== undefined;
    }
}

export class ParameterVertex implements DataVertex {
    get kind() { return VertexKind.Parameter; }
    get category(): VertexCategory.Data { return VertexCategory.Data; }

    public position?: number;

    constructor(position?: number) {
        this.position = position;
    }

    verify(): boolean {
        return this.position !== undefined;
    }
}

export abstract class UnaryOperationVertex implements DataVertex {
    abstract get kind(): VertexKind;
    get category(): VertexCategory.Data { return VertexCategory.Data; }

    public operator?: Operator;
    public operand?: DataVertex;

    constructor(operator?: Operator, operand?: DataVertex) {
        this.operator = operator;
        this.operand = operand;
    }

    verify(): boolean {
        return this.operator !== undefined && this.operand !== undefined;
    }
}

export class PrefixUnaryOperationVertex extends UnaryOperationVertex {
    get kind() { return VertexKind.PrefixUnaryOperation; }
}

export class PostfixUnaryOperationVertex extends UnaryOperationVertex {
    get kind() { return VertexKind.PostfixUnaryOperation; }
}

export class BinaryOperationVertex implements DataVertex {
    get kind() { return VertexKind.BinaryOperation; }
    get category(): VertexCategory.Data { return VertexCategory.Data; }

    public operator?: Operator;
    public left?: DataVertex;
    public right?: DataVertex;

    constructor(operator?: Operator, left?: DataVertex, right?: DataVertex) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    verify(): boolean {
        return this.operator !== undefined && this.left !== undefined && this.right !== undefined;
    }
}

export type PhiOperand = {value: DataVertex, srcBranch: ControlVertex};

export class PhiVertex implements DataVertex {
    get kind() { return VertexKind.Phi; }
    get category(): VertexCategory.Data { return VertexCategory.Data; }

    public readonly operands: Array<PhiOperand>;
    public merge?: MergeVertex;

    constructor(operands?: Array<PhiOperand>, merge?: MergeVertex) {
        this.merge = merge;
        if (operands !== undefined) {
            this.operands = operands;
        }
        else {
            this.operands = [];
        }
    }

    addOperand(operand: PhiOperand) {
        this.operands.push(operand);
    }

    verify(): boolean {
        return this.merge !== undefined && this.operands.length > 1;
    }
}

export interface ControlVertex extends Vertex {
    category: VertexCategory.Control | VertexCategory.Compound;
}

export abstract class NonTerminalControlVertex implements ControlVertex {
    abstract get kind(): VertexKind;
    abstract get category(): VertexCategory.Control | VertexCategory.Compound;

    public next?: ControlVertex;

    constructor(next?: ControlVertex) {
        this.next = next;
    }

    verify(): boolean {
        return this.next !== undefined;
    }
}

export class StartVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.Start; }
    get category(): VertexCategory.Control { return VertexCategory.Control; }
}

export class PassVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.Pass; }
    get category(): VertexCategory.Control | VertexCategory.Compound { return VertexCategory.Control; }
}

export class ReturnVertex implements ControlVertex {
    get kind() { return VertexKind.Return; }
    get category(): VertexCategory.Control { return VertexCategory.Control; }

    public value?: DataVertex;

    constructor(value?: DataVertex) {
        this.value = value;
    }

    verify(): boolean {
        return true;
    }
}

export class BranchVertex implements ControlVertex {
    get kind() { return VertexKind.Branch; }
    get category(): VertexCategory.Control { return VertexCategory.Control; }

    public condition?: DataVertex;
    public trueNext?: ControlVertex;
    public falseNext?: ControlVertex;

    constructor(condition: DataVertex, trueNext: ControlVertex, falseNext: ControlVertex) {
        this.condition = condition;
        this.trueNext = trueNext;
        this.falseNext = falseNext;
    }

    verify(): boolean {
        return this.condition !== undefined && this.trueNext !== undefined && this.falseNext !== undefined;
    }
}

export class MergeVertex extends NonTerminalControlVertex { // ? should add corresponding branch?
    get kind() { return VertexKind.Merge; }
    get category(): VertexCategory.Control { return VertexCategory.Control; }
}

export class AllocationVertex extends PassVertex implements DataVertex {
    get kind() { return VertexKind.Allocation; }
    get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    public objectType?: string;
    public constructorSymbol?: SymbolVertex;

    constructor(objectType?: string, constructorSymbol?: SymbolVertex, next?: ControlVertex) {
        super(next);
        this.objectType = objectType;
        this.constructorSymbol = constructorSymbol;
    }

    verify(): boolean {
        return this.objectType !== undefined && this.constructorSymbol !== undefined && super.verify();
    }
}

export class StoreVertex extends PassVertex {
    get kind() { return VertexKind.Store; }
    get category(): VertexCategory.Control { return VertexCategory.Control; }

    public object?: DataVertex;
    public property?: DataVertex;
    public value?: DataVertex;

    constructor(object?: DataVertex, property?: DataVertex, value?: DataVertex, next?: ControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
        this.value = value;
    }

    verify(): boolean {
        return this.object !== undefined && this.property !== undefined && this.value !== undefined && super.verify();
    }
}

export class LoadVertex extends PassVertex implements DataVertex {
    get kind() { return VertexKind.Load; }
    get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    public object?: DataVertex;
    public property?: DataVertex;

    constructor(object?: DataVertex, property?: DataVertex, next?: ControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
    }

    verify(): boolean {
        return this.object !== undefined && this.property !== undefined && super.verify();
    }
}

export class CallVertex extends PassVertex implements DataVertex {
    get kind() { return VertexKind.Call; }
    get category(): VertexCategory.Compound { return VertexCategory.Compound; }

    public callee?: DataVertex;
    public args?: Array<DataVertex>;
    public callerObject?: DataVertex;

    constructor(callee?: DataVertex, args?: Array<DataVertex>, callerObject?: DataVertex, next?: ControlVertex) {
        super(next);
        this.callee = callee;
        this.args = args;
        this.callerObject = callerObject;
    }

    verify(): boolean {
        return this.callee !== undefined && this.args !== undefined && super.verify();
    }
}
