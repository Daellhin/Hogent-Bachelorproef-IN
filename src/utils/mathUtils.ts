export function radiansToDegrees(radians: number) {
    return (radians * 180.0) / Math.PI;
}

export function degreesToRadians(degrees: number) {
    return (degrees * Math.PI) / 180.0;
}

/**
 * Convert polar to Cartesian coordinates
 * Polar: position is determined by the distance and angle from te center
 * Cartesian: position is determined the distance along each axis
 */
export function polarToCartesian2D(centerX: number, centerY: number, radius: number, angleInRadians: number) {
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

/**
 * Modulo helper, accepts negative numbers and returns positive ones
 */
export function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

export function modRad(angle: number) {
    return  mod(angle, 2 * Math.PI);
}
