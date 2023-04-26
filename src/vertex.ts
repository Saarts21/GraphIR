
type Value = number | string | boolean
type Operator = string

enum VertexKind {
    Literal = 'Literal',
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

interface Vertex {
    kind: VertexKind;
    isComplete(): boolean;
}

interface DataVertex extends Vertex {
}

class LiteralVertex implements DataVertex {
    get kind() { return VertexKind.Literal; }

    public value?: Value;

    constructor(value?: Value) {
        this.value = value;
    }

    isComplete(): boolean {
        return this.value !== undefined;
    }
}

class ParameterVertex implements DataVertex {
    get kind() { return VertexKind.Parameter; }

    isComplete(): boolean {
        return true;
    }
}

abstract class UnaryOperationVertex implements DataVertex {
    abstract get kind(): VertexKind;

    public operator?: Operator;
    public operand?: DataVertex;

    constructor(operator?: Operator, operand?: DataVertex) {
        this.operator = operator;
        this.operand = operand;
    }

    isComplete(): boolean {
        return this.operator !== undefined && this.operand !== undefined;
    }
}

class PrefixUnaryOperationVertex extends UnaryOperationVertex {
    get kind() { return VertexKind.PrefixUnaryOperation; }
}

class PostfixUnaryOperationVertex extends UnaryOperationVertex {
    get kind() { return VertexKind.PostfixUnaryOperation; }
}

class BinaryOperationVertex implements DataVertex {
    get kind() { return VertexKind.BinaryOperation; }

    public operator?: Operator;
    public left?: DataVertex;
    public right?: DataVertex;

    constructor(operator: Operator, left: DataVertex, right: DataVertex) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    isComplete(): boolean {
        return this.operator !== undefined && this.left !== undefined && this.right !== undefined;
    }
}

type PhiOperand = {value: DataVertex, srcBranch: ControlVertex};

class PhiVertex implements DataVertex {
    get kind() { return VertexKind.Phi; }

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

    isComplete(): boolean {
        return this.merge !== undefined && this.operands.length > 1;
    }
}

interface ControlVertex extends Vertex {
}

abstract class NonTerminalControlVertex implements ControlVertex {
    abstract get kind(): VertexKind;

    public next?: ControlVertex;

    constructor(next?: ControlVertex) {
        this.next = next;
    }

    isComplete(): boolean {
        return this.next !== undefined;
    }
}

class StartVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.Start; }
}

class PassVertex extends NonTerminalControlVertex {
    get kind() { return VertexKind.Pass; }
}

class ReturnVertex implements ControlVertex {
    get kind() { return VertexKind.Return; }

    public value?: DataVertex;

    constructor(value: DataVertex) {
        this.value = value;
    }

    isComplete(): boolean {
        return true;
    }
}

class BranchVertex implements ControlVertex {
    get kind() { return VertexKind.Branch; }

    public condition?: DataVertex;
    public trueNext?: ControlVertex;
    public falseNext?: ControlVertex;

    constructor(condition: DataVertex, trueNext: ControlVertex, falseNext: ControlVertex) {
        this.condition = condition;
        this.trueNext = trueNext;
        this.falseNext = falseNext;
    }

    isComplete(): boolean {
        return this.condition !== undefined && this.trueNext !== undefined && this.falseNext !== undefined;
    }
}

class MergeVertex extends NonTerminalControlVertex { // ? should add corresponding branch?
    get kind() { return VertexKind.Merge; }
}

class AllocationVertex extends PassVertex implements DataVertex {
    get kind() { return VertexKind.Allocation; }

    constructor(next: ControlVertex) {
        super(next);
    }
}

class StoreVertex extends PassVertex {
    get kind() { return VertexKind.Store; }

    public object?: DataVertex;
    public property?: DataVertex;
    public value?: DataVertex;

    constructor(object?: DataVertex, property?: DataVertex, value?: DataVertex, next?: ControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
        this.value = value;
    }

    isComplete(): boolean {
        return this.object !== undefined && this.property !== undefined && this.value !== undefined && super.isComplete();
    }
}

class LoadVertex extends PassVertex implements DataVertex {
    get kind() { return VertexKind.Load; }

    public object?: DataVertex;
    public property?: DataVertex;

    constructor(object?: DataVertex, property?: DataVertex, next?: ControlVertex) {
        super(next);
        this.object = object;
        this.property = property;
    }

    isComplete(): boolean {
        return this.object !== undefined && this.property !== undefined && super.isComplete();
    }
}

class CallVertex extends PassVertex implements DataVertex {
    get kind() { return VertexKind.Call; }

    public callee?: DataVertex;
    public args?: Array<DataVertex>;
    public callerObject?: DataVertex;

    constructor(callee?: DataVertex, args?: Array<DataVertex>, callerObject?: DataVertex, next?: ControlVertex) {
        super(next);
        this.callee = callee;
        this.args = args;
        this.callerObject = callerObject;
    }

    isComplete(): boolean {
        return this.callee !== undefined && this.args !== undefined && super.isComplete();
    }
}
