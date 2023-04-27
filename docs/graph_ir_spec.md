
# Graph IR  Specification

## Introduction

Graph IR is an intermediate representation of computer programs, in the form of a directed graph. It is designed to represent programs in such way that it would be rather easy to perform static analysis and optimizations on them.


## Graph Structure
(i.e syntax)

There are several types of vertices in the graph, Some are classified as "Data Vertices", some as "Control Vertices" and some are both. Also there are two kinds of edges: "Data Edges" and "Control Edges".

### Edges

1. Data Edges - Edges which has a data vertex as a target. The source of the is either a control vertex or a data vertex.
1. Control Edges - Edges which has a control vertex as a source and a control vertex as a target.

Each edge has a label, which is either a string or a number.

### (Strictly) Data Vertices
Data vertices may be one of the following kinds:
1. Literal - Includes a value and has no outgoing edges.
1. Parameter - Includes a position and has no outgoing edges.
1. Operation - Includes an operator, has 1 or 2 outgoing edges to other data vertices.
1. Phi - Has 2 or more outgoing edges to other data vertices.

Each data vertex may have any number of incoming data edges.

### Control Vertices
Control vertices may be one of the following kinds:
1. Start - Has 1 outgoing "next" edge to a control vertex.
1. Pass - Has 1 incoming "next" edge and 1 outgoing "next" edge to a control vertex. Pass vertices *may* be of the following sub-kind:
    * Allocation - Also counts as a data vertex.
    * Call - Also counts as a data vertex. Has 1 outgoing "callee" data edge, any number of outgoing "argument" data edge and up to 1 outgoing caller object" data edge.
    * Store - Has 1 outgoing "object" data edge, 1 outgoing "property" data edge and 1 outgoing "value" data edge.
    * Load - Also counts as a data vertex. Has 1 outgoing "object" data edge and 1 outgoing "property" data edge.
1. Branch - Has 1 incoming "next" control edge, 1 outgoing "condition" data edge, 1 outgoing "true" control edge, 1 outgoing "false" control edge.
1. Merge - Has any number of incoming "next" control edges and 1 outgoing "next" control edge.
1. Return - Has 1 incoming "next" control edge and up to 1 outgoing "value" data edge.

## Graph Meaning
(i.e semantics)

> TODO: Complete this section
