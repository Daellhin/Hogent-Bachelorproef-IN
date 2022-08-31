export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Return `true` when string is: null, undefined or ""
 */
export function isEmpty(string: string) {
    return !string?.length;
}

/**
 * Return `true` when string is not: null, undefined or ""
 */
export function isNotEmpty(string: string) {
    return !isEmpty(string);
}

/**
 * Return `true` when all strings are:  null, undefined or ""
 */
export function areEmpty(...strings: string[]) {
    return strings.find((string) => isNotEmpty(string)) === undefined;
}

/**
 * Return `true` when all strings are not:  null, undefined or ""
 */
export function areNotEmpty(...strings: string[]) {
    return strings.find((string) => isEmpty(string)) === undefined;
}
