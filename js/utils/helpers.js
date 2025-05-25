export async function getJsonData(filename) {
    const response = await fetch(`../data/${filename}.json`);
    return await response.json();
}

export function createElement(tag, options = {}) {
    const el = document.createElement(tag);
    Object.assign(el, options);
    return el;
}
