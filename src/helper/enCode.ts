const defaultStep = 17

export const caesarShift = (str: string, amount: number): string => {
    if (str === null) {
        return '';
    }
    if (amount < 0) {
        return caesarShift(str, amount + 26);
    }

    let output: string = "";

    for (let i: number = 0; i < str.length; i++) {
        let c: string = str[i];
        if (c.match(/[a-z]/i) || c.match(/[0-9]/i)) {
            let code: number = str.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
        }
        output += c;
    }
    return output;
}

const reverseItem = (item: string) => {
    let result = '';
    for (let i = item.length - 1; i >= 0; --i) {
        result += item[i];
    }
    return result;
}
export const enCrypt = (item: string) => {
    item = reverseItem(item);
    let enCode = encodeURI(item);
    return caesarShift(enCode, defaultStep);
}

export const deCrypt = (item: string) => {
    let deCode = caesarShift(item, -defaultStep);
    deCode = decodeURI(deCode);
    return reverseItem(deCode);
}

export const hash = (item: string) => {
    item = item.toString();
    let hash = 0;
    for (let i = 0; i < item.length; ++i) {
        let char = item.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash &= hash + 1 % (1e9 + 7);
    }
    hash = hash < 0 ? hash * -1 : hash;
    return hash.toString().repeat(5);
}

export const cryptItem = (str: string, seed: number = 0) => {
    let h1: number = 0xdeadbeef ^ seed, h2: number = 0x41c6ce57 ^ seed;
    for (let i: number = 0, ch; i < str.length; ++i) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    let item = 4294967296 * (2097151 & h2) + (h1 >>> 1);
    item = item < 0 ? item * -1 : item;
    return item.toString().repeat(5);
};

export const enCryptName = (item: string) => cryptItem(item) + hash(item);