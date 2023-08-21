//thank you pretendo for the decoding

function decodeParamPack(input) {
    let base64Result = Buffer.from(input, 'base64').toString();

    base64Result = base64Result.slice(1, -1).split("\\");
        
    const out = {};
    for (let i = 0; i < base64Result.length; i += 2) {
        out[base64Result[i].trim()] = base64Result[i + 1].trim();
    }
    return out;
}

module.exports = {decodeParamPack}