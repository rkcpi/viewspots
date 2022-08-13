# View spot finder

Finds the view spots in a given mesh ordered by their value, heighest to lowest, and prints them to stdout.

## Build

First build the app:
```bash
yarn build
```

## Usage

Execute the app with a path to a json file that describes the mesh and the number of desired view spots. If the number paramter is not given, not a number, or higher than the maximum number of view spots, all view spots will be returned.

```bash
node build/src/index.js <path-to-mesh-json> [<number-of-view-spots>]
```

## Configuration

The following environment variables can influence the calculation:
- `SANITY_CHECK`: if set to `true` the mesh json will be checked for validity before starting the calculation