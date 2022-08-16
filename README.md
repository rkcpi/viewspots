# View spot finder

Finds the view spots in a given mesh ordered by their value, heighest to lowest, and prints them to stdout. A view spot is defined
as an element that has a greater value than all its neighbours. A neighbour is an element that shares at least one node.

## Build

```bash
yarn build
```

## Usage

Execute the app with a path to a json file that describes the mesh and the number of desired view spots. If the number paramter is not given, not a number, or higher than the maximum number of view spots, all view spots will be returned.

```bash
node build/src/index.js <path-to-mesh-json> [<number-of-view-spots>]
```

## Input

```json
{
  "nodes": [
    {"id:" node_id1, "x": <number value>, "y": <number value>},
    {"id": node_id2, "x": <number value>, "y": <number value>},
    {"id": node_id3, "x": <number value>, "y": <number value>},
    ...
  ],
  "elements": [
    {"id": element_id1, "nodes": [node_id1, node_id2, node_id3]},
    ...
  ],
  "values": [
    {"element_id": element_id1, "value": <number value>}, ...
  ]
}
```

## Output

The list of elements that are viewspots with their value, printed to stdout:

```json
[
  {"element_id": element_id1, "value": <number value>},
  ...
]
```

## Configuration

The following environment variables can influence the calculation:
- `SANITY_CHECK`: if set to `true`, the mesh json will be checked for validity before starting the calculation