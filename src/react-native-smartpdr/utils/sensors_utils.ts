export function object_sign_inversion(obj) {
  return Object.assign(
    {}, ...Object.entries(obj).map(([key, val]) => ({ [key]: -val }))
  );
}

export function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

export function range(deg: number, mode: '2PI' | 'PI') {
  switch (mode) {
    case '2PI': {
      deg %= 2 * Math.PI;
      if (deg < 0) deg += 2 * Math.PI;
      break;
    }
    case 'PI': {
      deg += Math.PI;
      deg %= 2 * Math.PI;
      deg < 0 ? (deg += Math.PI) : (deg -= Math.PI);
      break;
    }
  }
  return deg;
}

export function LPFilter(value1, value2, alpha = 0.95) {
  return alpha * value1 + (1 - alpha) * value2;
}

export function compFilter(value1, value2, alpha = 0.95) {
  return Math.abs(value1 - value2) < Math.PI
    ? alpha * value1 + (1 - alpha) * value2
    : value2;
}

export function argmin(list1, list2 = list1) {
  return list2.indexOf(list1.reduce((a, b) => Math.min(a, b)));
}

export function toGCS(lcs, attitude, T = false) {
  let { pitch, roll, yaw } = attitude;
  const Rx = (deg) => {
    return [
      [1, 0, 0],
      [0, -Math.cos(deg), Math.sin(deg)],
      [0, Math.sin(deg), Math.cos(deg)],
    ];
  };

  const Ry = (deg) => {
    return [
      [Math.cos(deg), 0, Math.sin(deg)],
      [0, 1, 0],
      [-Math.sin(deg), 0, Math.cos(deg)],
    ];
  };

  const Rz = (deg) => {
    return [
      [Math.cos(deg), Math.sin(deg), 0],
      [-Math.sin(deg), Math.cos(deg), 0],
      [0, 0, 1],
    ];
  };

  const _matrix_times = (mat1, mat2) => {
    let ret = new Array();
    for (let i = 0; i < 3; i++) {
      ret[i] = new Array(3).fill(0);
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          ret[i][j] += mat1[i][k] * mat2[k][j];
        }
      }
    }
    return ret;
  };

  const R = _matrix_times(_matrix_times(Rz(yaw), Rx(pitch)), Ry(roll));

  // T mean transpose. If T is true, R is transposed matrix.
  // If T is false, R is rotation matrix.
  if (T) {
    return {
      x: R[0][0] * lcs.x + R[1][0] * lcs.y + R[2][0] * lcs.z,
      y: R[0][1] * lcs.x + R[1][1] * lcs.y + R[2][1] * lcs.z,
      z: R[0][2] * lcs.x + R[1][2] * lcs.y + R[2][2] * lcs.z,
    };
  } else {
    return {
      x: R[0][0] * lcs.x + R[0][1] * lcs.y + R[0][2] * lcs.z,
      y: R[1][0] * lcs.x + R[1][1] * lcs.y + R[1][2] * lcs.z,
      z: R[2][0] * lcs.x + R[2][1] * lcs.y + R[2][2] * lcs.z,
    };
  }
}
