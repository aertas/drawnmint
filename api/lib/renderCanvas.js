const fs = require('fs');
const {loadImage, createCanvas} = require('canvas');

/** Standart Images */
exports.draw = async function (hash, key, workData, sideSize) {

    switch (Number(workData.seasonid)) {
        case 1:
            return await seasonOneDraw(hash, key, workData, sideSize);
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
    }
}

async function seasonOneDraw(hash, key, workData, sideSize) {
    const
        imgId = workData.imgid,
        fileName = hash.toString() + '.png',
        returnPath = "./cache/" + key + "/" + fileName,
        imgFront = './assets/seasonone/' + imgId + '.png',
        imgBg = './assets/seasonone/' + imgId + '-bg.png',
        imgLogo = './assets/seasonone/logo.png'
    ;
    const
        DEFAULT_SIZE = 1080,
        AR = sideSize / DEFAULT_SIZE,
        width = sideSize,
        height = sideSize,
        canvas = createCanvas(width, height),
        ctx = canvas.getContext('2d'),
        alphaVal = "70"
    ;
    let x, y;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    await loadImage(imgBg)
        .then((data) => {
            ctx.drawImage(data, 0, 0, width, height)
        });

    for (let i in workData.lines) {
        ctx.strokeStyle = workData.lines[i].hex + (workData.lines[i].hex === "#ffffff" ? "" : alphaVal);
        ctx.lineWidth = workData.lines[i].weight * AR;
        ctx.beginPath();

        if(workData.lines[i].points[0] && workData.lines[i].points[0][0]){
            x = Number(workData.lines[i].points[0][0] * width);
            y = Number(workData.lines[i].points[0][1] * height);
            ctx.moveTo(x, y);
            workData.lines[i].points.forEach(point => {
                x = Number(point[0] * width);
                y = Number(point[1] * height);
                ctx.lineTo(x, y);
            });
            ctx.stroke();
        }
    }

    await loadImage(imgFront)
        .then((data) => {
            ctx.drawImage(data, 0, 0, width, height)
        });

    await loadImage(imgLogo)
        .then((data) => {
            ctx.drawImage(data, 10 * AR, 10 * AR, 220 * AR, 128 * AR)
            const imgBuffer = canvas.toBuffer('image/png')
            fs.writeFileSync(returnPath, imgBuffer)
        });

    return returnPath;
}