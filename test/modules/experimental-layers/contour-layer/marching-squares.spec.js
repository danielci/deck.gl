import test from 'tape-catch';
import {getCode, getVertices, CONTOUR_TYPE} from '@deck.gl/layers/contour-layer/marching-squares';

const GETCODE_TESTS = [
  // ISO LINES
  {
    cellWeights: [5, 5, 5, 10],
    code: 4
    /*
    ---------
    |   |   |
    | 5 *10 |
    |   |   |
    ----#-*--
    |   |   |
    | 5 | 5 |
    |   |   |
    ---------
    // # is reference vertex
    // * are intersection points for code#4 (North and East with reference to #)
    */
  },
  {
    cellWeights: [5, 5, 5, 5],
    code: 0
  },
  {
    cellWeights: [5, 10, 5, 10],
    code: 6
  },
  {
    cellWeights: [10, 10, 10, 10],
    code: 15
  },

  // non zero cellIndex
  {
    cellWeights: [
      // ----------------
      // |  5 | 10 | 10 | => row-2
      // ----------------
      // | 5  |  5 |  5 | => row-1
      // ----------------
      // | 5  |  5 |  5 | => row-0
      // ---------------
      // row-0
      5,
      5,
      5,
      // row-1
      5,
      5,
      5,
      // row-2
      5,
      10,
      10
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 12
  },
  {
    cellWeights: [
      // row-0
      5,
      5,
      5,
      // row-1
      10,
      5,
      5,
      // row-2
      10,
      5,
      5
    ],
    gridSize: [3, 3],
    x: 0,
    y: 1,
    code: 9
  },

  // saddle cases
  {
    cellWeights: [
      // row-0
      5,
      5,
      5,
      // row-1
      5,
      1,
      6,
      // row-2
      5,
      6,
      1
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 10,
    meanCode: 0
  },
  {
    cellWeights: [
      // row-0
      5,
      5,
      5,
      // row-1
      5,
      5,
      10,
      // row-2
      5,
      10,
      5
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 10,
    meanCode: 1
  },

  // ISO BANDS
  {
    cellWeights: [5, 5, 5, 3],
    code: 154, // 2122
    threshold: [2, 4]
    /*
    ---------
    |   |   |
    | 5 * 3 |
    |   |   |
    ----#-*--
    |   |   |
    | 5 | 5 |
    |   |   |
    ---------
    // # is reference vertex
    // * are intersection points for code#4 (North and East with reference to #)
    */
  },
  {
    cellWeights: [5, 5, 5, 5],
    code: 170,
    threshold: [2, 4]
  },
  // single triangle case
  {
    cellWeights: [2, 5, 5, 5],
    threshold: [2, 4],
    code: 169
  },
  // single trapezoid case
  {
    cellWeights: [10, 1, 10, 10],
    threshold: [2, 9],
    code: 162
  },
  // single rectangle case
  {
    // 1122
    cellWeights: [10, 10, 2, 9],
    threshold: [2, 9],
    code: 90
  },
  // single hexagon case
  {
    cellWeights: [3, 0, 9, 30],
    threshold: [2, 9],
    code: 97
  }
  //
  // // non zero cellIndex
  // {
  //   cellWeights: [
  //     // ----------------
  //     // |  5 | 10 | 10 | => row-2
  //     // ----------------
  //     // | 5  |  5 |  5 | => row-1
  //     // ----------------
  //     // | 5  |  5 |  5 | => row-0
  //     // ---------------
  //     // row-0
  //     5,
  //     5,
  //     5,
  //     // row-1
  //     5,
  //     5,
  //     5,
  //     // row-2
  //     5,
  //     10,
  //     10
  //   ],
  //   gridSize: [3, 3],
  //   x: 1,
  //   y: 1,
  //   code: 12
  // },
  // {
  //   cellWeights: [
  //     // row-0
  //     5,
  //     5,
  //     5,
  //     // row-1
  //     10,
  //     5,
  //     5,
  //     // row-2
  //     10,
  //     5,
  //     5
  //   ],
  //   gridSize: [3, 3],
  //   x: 0,
  //   y: 1,
  //   code: 9
  // },
  //
  // // saddle cases
  // {
  //   cellWeights: [
  //     // row-0
  //     5,
  //     5,
  //     5,
  //     // row-1
  //     5,
  //     1,
  //     6,
  //     // row-2
  //     5,
  //     6,
  //     1
  //   ],
  //   gridSize: [3, 3],
  //   x: 1,
  //   y: 1,
  //   code: 10,
  //   meanCode: 0
  // },
  // {
  //   cellWeights: [
  //     // row-0
  //     5,
  //     5,
  //     5,
  //     // row-1
  //     5,
  //     5,
  //     10,
  //     // row-2
  //     5,
  //     10,
  //     5
  //   ],
  //   gridSize: [3, 3],
  //   x: 1,
  //   y: 1,
  //   code: 10,
  //   meanCode: 1
  // },

];

const GETVERTEX_TESTS = [
  // ISO-LINES
  {
    gridOrigin: [100, 200],
    code: 4,
    vertices: [[110, 230], [115, 220]]
  },
  {
    gridOrigin: [100, 200],
    code: 0,
    vertices: []
  },
  {
    gridOrigin: [100, 200],
    code: 6,
    vertices: [[110, 230], [110, 210]]
  },
  {
    gridOrigin: [100, 200],
    code: 15,
    vertices: []
  },

  // non zero cellIndex
  {
    gridOrigin: [100, 200],
    code: 12,
    x: 1,
    y: 1,
    vertices: [[115, 240], [125, 240]],
    gridSize: [3, 3]
  },
  {
    gridOrigin: [100, 200],
    code: 9,
    x: 0,
    y: 1,
    vertices: [[110, 250], [110, 230]],
    gridSize: [3, 3]
  },

  // saddle cases
  {
    gridOrigin: [100, 200],
    code: 5,
    meanCode: 0,
    x: 0,
    y: 0,
    vertices: [[105, 220], [110, 230], [110, 210], [115, 220]],
    gridSize: [3, 3]
  },
  {
    gridOrigin: [100, 200],
    code: 5,
    meanCode: 1,
    x: 0,
    y: 0,
    vertices: [[105, 220], [110, 210], [110, 230], [115, 220]],
    gridSize: [3, 3]
  },

  // ISO-BANDS
  {
    gridOrigin: [100, 200],
    code: 154,
    // REF
    vertices: [[[110, 230], [115, 230], [115, 220]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },

];

test('MarchingSquares#getCode', t => {
  const threshold = 6;
  const x = 0;
  const y = 0;
  const gridSize = [2, 2];
  GETCODE_TESTS.forEach(testCase => {
    const {code, meanCode} = getCode({
      cellWeights: testCase.cellWeights,
      threshold: testCase.threshold || threshold,
      x: testCase.x || x,
      y: testCase.y || y,
      width: testCase.gridSize ? testCase.gridSize[0] : gridSize[0],
      height: testCase.gridSize ? testCase.gridSize[1] : gridSize[1]
    });
    t.equals(code, testCase.code, `Code: expected: ${testCase.code}, actual: ${code}`);
    if (testCase.meanCode) {
      // if meanCode needed for this case
      t.equals(meanCode, testCase.meanCode, `manCoode: expected: ${testCase.meanCode}, actual: ${meanCode}`);
    }
  });
  t.end();
});

test('MarchingSquares#getVertices', t => {
  const x = 0;
  const y = 0;
  const cellSize = [10, 20];
  GETVERTEX_TESTS.forEach(testCase => {
    const vertices = getVertices({
      gridOrigin: testCase.gridOrigin,
      x: testCase.x || x,
      y: testCase.y || y,
      cellSize,
      code: testCase.code,
      meanCode: testCase.meanCode,
      type: testCase.type || CONTOUR_TYPE.ISO_LINES
    });
    t.deepEquals(
      vertices,
      testCase.vertices,
      `Vertices: expected: ${testCase.vertices}, actual: ${vertices}`
    );
  });
  t.end();
});