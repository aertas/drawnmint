const fs = require('fs');
const {getimgs, getStory} = require("./imgs");

const imgs = getimgs();

exports.createMetadata = async function (hash, tokenid, workData) {
    const jsonPrototype = fs.readFileSync("./lib/prototype.json", 'utf8');
    const jsonData = JSON.parse(jsonPrototype);

    jsonData.name = imgs[workData.imgid] + " #" + pad(tokenid, 4);
    jsonData.hash = hash.toString();
    jsonData.tokenid = Number(tokenid);
    jsonData.sketchid = Number(workData.imgid);
    jsonData.image = process.env.API_BASE + "/image/thumb/" + hash + ".png";
    jsonData.animation_url = process.env.API_BASE + "/html/" + hash + ".html";
    jsonData.external_url = process.env.WEB_BASE + "/nfts/" + hash;
    jsonData.description = '# ' + imgs[workData.imgid] + '\n\n' +
        '> "' + imgs[workData.imgid] + '" ' + getStory(workData.imgid) + "\n\n" +
        'If you want, you can **paint** one ["' + imgs[workData.imgid] + '"]' +
        '(' + process.env.WEB_BASE + "/?imgid=" + workData.imgid + ') or ' +
        "**examine** the NFT [detail page]" +
        "(" + process.env.WEB_BASE + "/nfts/" + hash + ").\n\n" +
        "---\n\n" +
        "## Developer\n\n" +
        "[@DevConcof](https://twitter.com/devconcof)\n\n" +
        "## Website\n\n" +
        "[aertas.com](https://www.aertas.com)\n\n"
    ;

    /** Attributes */
    jsonData.attributes = [];

    // Season
    let seasons = {
        1: "Season One",
        2: "Season Two",
        3: "Season Three",
        4: "Season Four",
    };
    jsonData.attributes.push({
        "trait_type": "Season",
        "value": seasons[Number(workData.seasonid)]
    });

    // Lines
    const lineCount = workData.lines.length;
    let pointCount = 0, hex;
    let colorCounts = {};
    let totalColorCount = 0;
    for (let i = 0; i < lineCount; i++) {
        pointCount += workData.lines[i].points.length;
        hex = workData.lines[i].hex;
        if (hex !== "#ffffff") {
            if (!colorCounts.hasOwnProperty(hex)) {
                colorCounts[hex] = 0;
            }
            colorCounts[hex] += workData.lines[i].points.length;
            totalColorCount += workData.lines[i].points.length;
        }
    }
    jsonData.attributes.push({
        "display_type": "number",
        "trait_type": "Line Count",
        "value": lineCount
    });
    jsonData.attributes.push({
        "display_type": "number",
        "trait_type": "Point Count",
        "value": pointCount
    });

    if (!isObjectEmpty(colorCounts)) {
        let percent, dominatColorPercent = 0, dominantColorHex = "";
        for (let hex in colorCounts) {
            percent = Math.round(colorCounts[hex] / totalColorCount * 1000) / 10;
            if (percent > dominatColorPercent) {
                dominatColorPercent = percent;
                dominantColorHex = hex;
            }
            jsonData.attributes.push({
                "display_type": "boost_percentage",
                "trait_type": hex + " Usage",
                "value": percent
            });
        }
        jsonData.attributes.push({
            "trait_type": "Dominant Color",
            "value": dominantColorHex
        });
    }
    return jsonData;
}

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function isObjectEmpty(obj) {
    for (let prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}