//thank you pretendo for the decoding

const pako = require('pako')
const TGA = require('tga')
const PNG = require('pngjs').PNG

function decodeParamPack(input) {
    let base64Result = Buffer.from(input, 'base64').toString();

    base64Result = base64Result.slice(1, -1).split("\\");
        
    const out = {};
    for (let i = 0; i < base64Result.length; i += 2) {
        out[base64Result[i].trim()] = base64Result[i + 1].trim();
    }
    return out;
}

function paintingProccess(painting) {
    let paintingBuffer = Buffer.from(painting, 'base64');
    let output = '';
    try {
        output = pako.inflate(paintingBuffer);
    }
    catch (err) {
        console.error(err);
    }
    let tga = new TGA(Buffer.from(output));
    let png = new PNG({
        width: tga.width,
        height: tga.height
    });
    png.data = tga.pixels;
    let pngBuffer = PNG.sync.write(png);
    return `${pngBuffer.toString('base64')}`;
}

module.exports = {decodeParamPack, paintingProccess}