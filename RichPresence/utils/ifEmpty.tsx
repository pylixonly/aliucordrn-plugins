export const ifEmpty = (str: string, altValue: string): string => {
    if (!str || str === "") {
       return str = altValue;
    }
    return str;
}