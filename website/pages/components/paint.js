import React, {Component} from 'react';
import styles from '../../styles/sketch.module.scss';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import {saveAs} from 'file-saver';

import Mint from "../../dapp/mint";
import {getimgids, getimgs} from "../../dapp/imgs";
import conf from "../../next.config";

const frameRate = 30;
const frameAnimMS = 1000 / frameRate;
const maxAnimTime = 18; //seconds
let animPlus = 1, playInterval, playingLineIndex, playingPointIndex;

const imgIds = getimgids();
let imgIdIndex = 0, imgId = Number(imgIds[imgIdIndex]), dataSaveKey;

let deletedLines,
    isLinesDeleted = false;

let closePanels, colorRangeChange;
let panelsClosed = true;
let workData = {
    settings: {},
    lines: [],
};
let eraseMode = false;

let isPlaying = false;

let defaultColors = [
    "#d00d0d",
    "#0b348d",
    "#ef9b1d",
    "#21bb85"
];

let startColor, startSize;
let startTime, EndTime;


class Sketch extends Component {

    init = false;
    renderRef;
    cursorCircle;
    sliderColor;
    panelColors;
    btnRed;
    btnGreen;
    btnYellow;
    btnBlue;
    btnUndo;
    btnErase;
    btnClear;
    btnSave;
    btnPlay;
    btnNext;
    btnPrev;
    btnRandom;
    btnExport;
    btnImport;
    importRef;
    alphaVal;
    currentHex;
    currentSize;

    constructor(props) {
        super(props);
        this.renderRef = React.createRef();
        this.cursorCircle = React.createRef();
        this.sliderColor = React.createRef();
        this.panelColors = React.createRef();
        this.btnRed = React.createRef();
        this.btnGreen = React.createRef();
        this.btnYellow = React.createRef();
        this.btnBlue = React.createRef();
        this.btnUndo = React.createRef();
        this.btnErase = React.createRef();
        this.btnClear = React.createRef();
        this.btnSave = React.createRef();
        this.btnPlay = React.createRef();
        this.btnNext = React.createRef();
        this.btnPrev = React.createRef();
        this.btnRandom = React.createRef();
        this.btnExport = React.createRef();
        this.btnImport = React.createRef();
        this.importRef = React.createRef();
        this.alphaVal = '70';
        startColor = this.currentHex = defaultColors[0];
        startSize = this.currentSize = (6 + 50) / 2;
    }

    componentDidMount() {
        const P5 = require("p5");
        let currentIndex = 0;
        let drawEnable = false;
        let mouseOn = false,
            canvas;

        if (!this.init) {
            this.sketch = new P5(p => {
                let DEFAULT_SIZE = 1080;
                let WIDTH;
                let HEIGHT;
                let SIDE;
                let AR;

                const bgColor = "#fff";
                let img, logo, bg, x, y;

                let params = p.getURLParams();
                if (params.hasOwnProperty("imgid")) {
                    if (imgIds.includes(Number(params.imgid))) {
                        imgId = Number(params.imgid);
                        imgIdIndex = imgIds.findIndex(num => num === imgId)
                    }
                }
                // if (imgId === -1) {
                //     imgIdIndex = Math.floor(Math.random() * imgIds.length);
                //     imgId = imgIds[imgIdIndex].toString();
                // }
                dataSaveKey = "drawnmintsave" + imgId.toString();
                if (typeof window !== 'undefined')
                    localStorage.setItem("dataSaveKey", dataSaveKey);

                const setData = (saveData) => {
                    if (typeof window !== 'undefined')
                        localStorage.setItem(dataSaveKey, JSON.stringify(saveData));
                };

                const getData = () => {
                    if (typeof window !== 'undefined')
                        return localStorage.getItem(dataSaveKey);
                };

                p.preload = () => {
                    img = p.loadImage('draws/' + imgId + '.png');
                    bg = p.loadImage('draws/' + imgId + '-bg.png');
                    logo = p.loadImage('images/logo.png');
                }

                let setupSize = () => {
                    if (p.windowWidth >= p.windowHeight) {
                        if (p.windowWidth <= 850) {
                            if (p.windowWidth > 550) {
                                SIDE = p.windowWidth -300;
                            } else {
                                SIDE = p.windowWidth;
                            }

                        } else {
                            SIDE = p.windowHeight - 100;
                        }
                    } else {
                        if (p.windowWidth <= 850) {
                            if (p.windowWidth > 550) {
                                SIDE = p.windowWidth -200;
                            } else {
                                SIDE = p.windowWidth;
                            }

                        } else {
                            SIDE = p.windowWidth - 100;
                        }

                    }
                    WIDTH = SIDE;
                    HEIGHT = SIDE;
                    AR = SIDE / DEFAULT_SIZE;
                    //p.pixelDensity(AR);
                }

                p.setup = () => {
                    setupSize();
                    p.frameRate(frameRate);
                    //p.pixelDensity(AR);
                    //p.blendMode(p.MULTIPLY);
                    workData.lines = [];
                    workData.hex = this.currentHex;
                    workData.size = this.currentSize;
                    workData.imgId = imgId.toString();
                    let allData = getData("allData")

                    if (allData && allData !== "undefined") {
                        let getWorkData = JSON.parse(allData);
                        //console.log(getWorkData);
                        if (Object.keys(getWorkData).length > 0) {
                            //workData = getWorkData;
                            //console.log(getWorkData.lines);
                            if (getWorkData.lines.length) {
                                workData.lines = getWorkData.lines;
                            }
                            workData.hex = this.currentHex = workData.hex || startColor;
                            workData.size = this.currentSize = workData.size || startSize;
                            this.sliderColor.current.value = 50;

                            /** Pallete Current Color */
                            resetColorButtons();

                            let curColorIndex = defaultColors.findIndex(num => num === this.currentHex);
                            let btnTmp = this.btnRed;
                            if (curColorIndex === 1) {
                                btnTmp = this.btnBlue;
                            } else if (curColorIndex === 2) {
                                btnTmp = this.btnYellow;
                            } else if (curColorIndex === 3) {
                                btnTmp = this.btnGreen;
                            }
                            btnTmp.current.style.backgroundImage = 'url("/images/paint.png")';
                            btnTmp.current.classList.add("badgePoint");
                        }

                    }
                    //console.log(workData);
                    p.noFill();
                    canvas = p.createCanvas(WIDTH, HEIGHT).parent(this.renderRef.current);

                    canvas.mouseOver(function () {
                        mouseOn = true;
                    })
                    canvas.mouseOut(function () {
                        mouseOn = false;
                    })
                    p.background(bgColor);
                    p.strokeWeight(this.currentSize);
                    document.getElementsByTagName("body")[0].classList.add("initialized");
                    setTimeout(() => {
                        document.getElementsByClassName("Sketch")[0].classList.add("initialized");
                    }, 500);
                    setTimeout(() => {
                        document.getElementsByClassName("toolbar")[0].classList.add("initialized");
                    }, 1800);
                    document.getElementsByClassName("site-logo")[0].classList.add("initialized");
                    setTimeout(() => {
                        document.getElementsByClassName("site-logo")[0].classList.add("hide");
                    }, 1000);
                }
                p.windowResized = () => {
                    setupSize();

                    p.resizeCanvas(WIDTH, HEIGHT);
                    p.background(bgColor);
                    p.strokeWeight(this.currentSize);

                    clearInterval(playInterval);
                    document.getElementsByClassName("toolbar")[0].classList.add("initialized");
                    isPlaying = false;
                    playingLineIndex = 0;
                    playingPointIndex = 0;
                    p.loop();
                }

                p.draw = () => {
                    p.background(bgColor);
                    p.push();
                    p.scale(AR);
                    p.image(bg, 0, 0, DEFAULT_SIZE, DEFAULT_SIZE);

                    let addPoint;
                    if (drawEnable) {
                        x = p.mouseX;
                        y = p.mouseY;
                        if (x > -1 && x < WIDTH && y > -1 && y < HEIGHT) {
                            x /= SIDE;
                            y /= SIDE;
                            x = Number(x.toFixed(3).substring(1, 5));
                            y = Number(y.toFixed(3).substring(1, 5));
                            if (x !== 0 && y !== 0) {
                                addPoint = true;
                                let pointCount = workData.lines[currentIndex].points.length;
                                if (pointCount > 1) {
                                    if (workData.lines[currentIndex].points[pointCount - 1][0] === x && workData.lines[currentIndex].points[pointCount - 1][1] === y) {
                                        addPoint = false;
                                    }
                                }
                                if (addPoint) {
                                    workData.lines[currentIndex].addPoint(x, y);
                                }
                            }
                        }
                    }

                    for (let i in workData.lines) {
                        p.push();
                        p.strokeJoin(p.ROUND);
                        p.stroke(workData.lines[i].hex + (workData.lines[i].hex === "#ffffff" ? "" : this.alphaVal));
                        p.strokeWeight(workData.lines[i].weight);
                        p.beginShape();
                        workData.lines[i].points.forEach(point => {
                            x = Number(point[0] * DEFAULT_SIZE);
                            y = Number(point[1] * DEFAULT_SIZE);
                            p.vertex(x, y);
                            //p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY)
                        });
                        p.endShape();
                        p.pop()
                    }
                    p.image(img, 0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
                    p.image(logo, WIDTH / HEIGHT > 0.6 ? 10 : ((WIDTH - 220) / 2), 10, 220, 128);
                    p.pop();

                    if (mouseOn) {
                        if (eraseMode) {
                            p.cursor('/images/erase.png', 0, 0);
                            p.push();
                            p.noFill();
                            p.strokeWeight(1);
                            p.stroke(0);
                            p.circle(p.mouseX, p.mouseY, this.currentSize * AR);
                            p.pop();
                        } else {
                            p.cursor('/images/paint.png', -12, -12);
                            p.push();
                            p.noFill();
                            p.strokeWeight(1);
                            p.stroke(this.currentHex);
                            p.circle(p.mouseX, p.mouseY, this.currentSize * AR);
                            p.pop();
                        }
                    }
                }

                p.mousePressed = (e) => {
                    if (!isPlaying && mouseOn && e.target.className === "p5Canvas" && p.mouseX < WIDTH && p.mouseX >= 0) {
                        currentIndex = workData.lines.length;
                        let _line = new line(currentIndex, eraseMode ? "#ffffff" : this.currentHex, this.currentSize);
                        workData.lines.push(_line);
                        drawEnable = true;
                        if (!panelsClosed) {
                            closePanels();
                        }
                    }
                }

                p.mouseReleased = () => {
                    if (!isPlaying && drawEnable) {
                        drawEnable = false;
                        deletedLines = [];
                        isLinesDeleted = false;
                        setData(workData);
                    }
                }

                p.keyTyped = (key) => {
                    if (!isPlaying) {
                        if (key.ctrlKey && key.code === "KeyZ") {
                            unDo()
                        }
                        if (key.code === "KeyS") {
                            //setData(moves);
                        }
                    }
                }

                const unDo = () => {
                    drawEnable = false;
                    if (isLinesDeleted) {
                        workData.lines = deletedLines;
                        isLinesDeleted = false;
                    } else {
                        if (workData.lines.length > 0) {
                            workData.lines.pop();
                        }
                    }
                    setData(workData);
                }
                const preventBehavior = (e) => {
                    e.preventDefault();
                    //e.stopPropagation();
                    return false;
                }
                this.renderRef.current.addEventListener("touchmove", preventBehavior, {passive: false});

                closePanels = () => {
                    this.panelColors.current.classList.remove("showPanel");
                    panelsClosed = true;
                }

                colorRangeChange = (evt) => {
                    this.currentSize = p.map(evt.target.value, 1, 100, 6, 50);
                    this.cursorCircle.current.style.transform = "scale(" + p.map(evt.target.value, 1, 100, .2, 1.1) + ")";
                    workData.size = evt.target.value;
                }

                const resetColorButtons = () => {
                    this.btnRed.current.classList.remove("badgePoint");
                    this.btnBlue.current.classList.remove("badgePoint");
                    this.btnYellow.current.classList.remove("badgePoint");
                    this.btnGreen.current.classList.remove("badgePoint");
                    this.btnRed.current.style.backgroundImage = '';
                    this.btnBlue.current.style.backgroundImage = '';
                    this.btnYellow.current.style.backgroundImage = '';
                    this.btnGreen.current.style.backgroundImage = '';
                }
                const eraseModeToggle = (onOff) => {
                    resetColorButtons();
                    closePanels();
                    eraseMode = onOff;
                    this.btnErase.current.setAttribute("data-current", eraseMode);
                    return true;
                }
                this.btnErase.current.addEventListener('click', () => eraseModeToggle(true));

                const colorPicked = (btn) => {
                    eraseModeToggle(false);
                    resetColorButtons();

                    btn.target.classList.add("badgePoint");
                    btn.target.style.backgroundImage = 'url("/images/paint.png")';
                    this.currentHex = btn.target.getAttribute("data-hex");
                    workData.hex = this.currentHex;
                    closePanels();
                    return true;
                }

                this.btnRed.current.addEventListener('click', colorPicked);
                this.btnBlue.current.addEventListener('click', colorPicked);
                this.btnYellow.current.addEventListener('click', colorPicked);
                this.btnGreen.current.addEventListener('click', colorPicked);
                this.btnRed.current.style.backgroundImage = 'url("/images/paint.png")';
                this.btnRed.current.classList.add("badgePoint");

                this.btnUndo.current.addEventListener('click', () => {
                    closePanels();
                    unDo();
                });

                this.btnClear.current.addEventListener('click', () => {
                    drawEnable = false;
                    closePanels();
                    if (workData.lines.length > 0) {
                        Swal.fire({
                            title: "CLEARING CANVAS!",
                            text: "Are you sure you want to continue?",
                            //icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: 'Yes, Clear!',
                            cancelButtonText: 'nope',
                        }).then((confirm) => {
                            if (confirm.isConfirmed) {
                                deletedLines = workData.lines;
                                isLinesDeleted = true;
                                workData.lines = [];
                                setData(workData);
                            }
                        });
                    }
                });

                this.btnSave.current.addEventListener('click', () => {
                    p.saveCanvas('drawnmint.png');
                });

                // Play
                const play = () => {
                    const drawFrame = () => {
                        p.background(bgColor);
                        p.push();
                        p.scale(AR);
                        p.image(bg, 0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
                        p.push();
                        p.strokeJoin(p.ROUND);
                        for (let pointMax, i = 0; i <= playingLineIndex; i++) {
                            pointMax = i < playingLineIndex ? workData.lines[i].points.length : playingPointIndex;
                            p.stroke(workData.lines[i].hex + (workData.lines[i].hex === "#ffffff" ? "" : this.alphaVal));
                            p.strokeWeight(workData.lines[i].weight);
                            p.beginShape();
                            for (let j = 0; j < pointMax; j++) {
                                if (j >= workData.lines[i].points.length) {
                                    playingLineIndex += 1;
                                    break;
                                }
                                //console.log(leftPadding, DEFAULT_SIZE);
                                x = Number(workData.lines[i].points[j][0] * DEFAULT_SIZE);
                                y = Number(workData.lines[i].points[j][1] * DEFAULT_SIZE);

                                p.vertex(x, y);

                                /*if (i === playingLineIndex && j + 1 === pointMax) {
                                    p.push();
                                    p.noFill();
                                    p.strokeWeight(1);
                                    p.stroke(workData.lines[i].hex);
                                    p.circle(x, y, workData.lines[i].weight * AR);
                                    p.pop();
                                }*/
                            }
                            p.endShape();
                        }
                        p.pop()
                        p.image(img, 0, 0, DEFAULT_SIZE, DEFAULT_SIZE);
                        p.image(logo, WIDTH / HEIGHT > 0.6 ? 10 : ((WIDTH - 220) / 2), 10, 220, 128);
                        p.pop();

                        let pointCount = workData.lines[playingLineIndex].points.length;
                        playingPointIndex += animPlus;
                        if (playingPointIndex >= pointCount) {
                            playingPointIndex = 0;
                            let addLineCount = 1;
                            let tempIndx = playingLineIndex + 1;
                            if (tempIndx < workData.lines.length && workData.lines[tempIndx].points.length < 5) {
                                addLineCount++;
                            }
                            playingLineIndex += addLineCount;
                        }
                        if (playingLineIndex >= workData.lines.length) {
                            clearInterval(playInterval);
                            document.getElementsByClassName("toolbar")[0].classList.add("initialized");
                            isPlaying = false;
                            playingLineIndex = 0;
                            playingPointIndex = 0;
                            p.loop();
                        }
                        //console.log(Math.floor(new Date().getTime() / 1000) - startTime);
                    }
                    playingLineIndex = 0;
                    playingPointIndex = 0;
                    let totalPointCount = workData.lines.length;
                    for (let i = 0; i < workData.lines.length; i++) {
                        workData.lines[i].points.forEach(() => {
                            totalPointCount++;
                        });
                    }

                    const totalMiliSeconds = maxAnimTime * 1000;
                    let intervalMiliSeconds = Math.min(Math.floor(totalMiliSeconds / totalPointCount), frameAnimMS);
                    if (intervalMiliSeconds < frameAnimMS) {
                        animPlus = (totalPointCount * frameAnimMS) / totalMiliSeconds;
                        intervalMiliSeconds = frameAnimMS;
                    }

                    // let startTime;
                    // startTime = Math.floor(new Date().getTime() / 1000);
                    playInterval = setInterval(drawFrame, intervalMiliSeconds);
                }

                this.btnPlay.current.addEventListener('click', () => {
                    if (workData.lines.length > 0) {
                        //document.getElementsByClassName("toolbar")[0].classList.add("initialized");
                        document.getElementsByClassName("toolbar")[0].classList.remove("initialized");
                        isPlaying = true;
                        drawEnable = false;
                        p.noLoop();
                        //p.noCursor();
                        p.cursor('default');
                        play();
                    }
                });

                this.btnNext.current.addEventListener('click', () => {
                    imgIdIndex++;
                    if (imgIdIndex === imgIds.length) {
                        imgIdIndex = 0;
                    }
                    location.href = "/?imgid=" + imgIds[imgIdIndex].toString();
                });
                this.btnPrev.current.addEventListener('click', () => {
                    imgIdIndex--;
                    if (imgIdIndex < 0) {
                        imgIdIndex = imgIds.length - 1;
                    }
                    location.href = "/?imgid=" + imgIds[imgIdIndex].toString();
                });

                this.btnRandom.current.addEventListener('click', () => {
                    let rand = null;  //an integer
                    while (rand === null || rand === imgId || rand === 0) {
                        rand = Math.round(Math.random() * imgIds.length);
                    }
                    window.location = "/?imgid=" + rand;
                });

                /** EXPORT JSON */
                this.btnExport.current.addEventListener('click', () => {
                    const fileName = "dnm-sketch-" + imgId + "-data.json";
                    const fileToSave = new Blob([JSON.stringify(workData)], {
                        type: 'application/json'
                    });
                    saveAs(fileToSave, fileName);
                });

                /** IMPORT JSON */

                let loadInit = false;
                this.btnImport.current.addEventListener('click', () => {
                    Swal.fire({
                        title: "IMPORT SKETCH DATA",
                        html: "<p>Please select sketch data file.</p>",
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    })
                    Swal.showLoading();
                    setTimeout(function () {
                        if (!loadInit) {
                            Swal.hideLoading();
                            Swal.update({
                                allowOutsideClick: true,
                                allowEscapeKey: true,
                                showConfirmButton: true,
                                confirmButtonText: "Close"
                            })
                        }
                    }, 7000);
                    this.importRef.current.click();
                });

                const onReaderLoad = (e) => {
                    loadInit = true;
                    Swal.update({
                        html: "<p>File is checking...</p>",
                    })
                    Swal.showLoading();
                    try {
                        const newData = JSON.parse(e.target.result);
                        if (
                            newData.hasOwnProperty("lines") &&
                            newData.hasOwnProperty("imgId") &&
                            newData.hasOwnProperty("hex") &&
                            newData.hasOwnProperty("size") &&
                            newData.lines.length > 0
                        ) {
                            console.log("ok");
                            console.log(newData);

                            Swal.fire({
                                title: "IMPORT SKETCH DATA",
                                html: "<p>The image is ready to import. The current drawing will disappear. Do you want to continue?</p>",
                                icon: "question",
                                showCancelButton: true,
                                confirmButtonText: 'Yes, Import!',
                                cancelButtonText: 'nope',
                            }).then((confirm) => {
                                loadInit = false;
                                if (confirm.isConfirmed) {
                                    Swal.update({
                                        html: "<p>File is importing</p>",
                                        showConfirmButton: false,
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                    })
                                    if (typeof window !== 'undefined')
                                        localStorage.setItem("drawnmintsave" + newData.imgId.toString(), JSON.stringify(newData));
                                    Swal.showLoading();
                                    window.location = "/?imgid=" + newData.imgId;
                                } else {
                                    Swal.update({
                                        html: "<p>File is checking...</p>",
                                    })
                                    Swal.showLoading();
                                    location.reload();
                                }
                            });
                        } else {
                            Swal.update({
                                html: "<p>File Error</p>",
                                icon: 'error',
                                allowOutsideClick: true,
                                allowEscapeKey: true,
                                showConfirmButton: true,
                            })
                            Swal.hideLoading();
                            loadInit = false;
                        }
                    } catch (e) {
                        Swal.update({
                            html: "<p>File Error</p>",
                            icon: 'error',
                            allowOutsideClick: true,
                            allowEscapeKey: true,
                            showConfirmButton: true,
                        })
                        Swal.hideLoading();
                        loadInit = false;
                        return false;
                    }
                }
                const onFileChange = (e) => {
                    try {
                        const reader = new FileReader();
                        reader.onload = onReaderLoad;
                        reader.readAsText(e.target.files[0]);
                    } catch (e) {
                        Swal.update({
                            html: "<p>File Error</p>",
                            icon: 'error',
                            allowOutsideClick: true,
                            allowEscapeKey: true,
                            showConfirmButton: true,
                        })
                        Swal.hideLoading();
                        loadInit = false;
                        return false;
                    }
                }
                this.importRef.current.addEventListener('change', onFileChange);
            });
            this.init = true;
        }
    }

    createSelectItems() {
        let items = [];
        for (let i = 1; i <= imgIds.length; i++) {
            items.push(<option key={i} value={i}>{i}</option>);
        }
        return items;
    }

    createNavLinks() {
        let items = [];
        for (let i = 1; i <= imgIds.length; i++) {
            items.push(<a key={i} className={i === imgId ? "active" : ""} href={"/?imgid=" + i}>{i}</a>);
        }
        return items;
    }

    MintContainer() {
        if (conf.dropActive) {
            return (
                <Mint imgID={imgId}/>
            );
        }
        return (
            <></>
        )
    }

    render() {
        return (
            <div className={styles.sketch + " Sketch"}>
                <div className="mint-group">
                    {this.MintContainer()}
                </div>
                <div className="sketch-group">
                    <div className={styles.toolbar + " toolbar"} ref={this.panelColors}>

                        <Tippy content="#d00d0d" placement="left">
                            <button className={styles.button + " " + styles.buttonRed}
                                    ref={this.btnRed} data-hex={defaultColors[0]}/>
                        </Tippy>
                        <Tippy content="#0b348d" placement="left">
                            <button className={styles.button + " " + styles.buttonBlue}
                                    ref={this.btnBlue} data-hex={defaultColors[1]}/>
                        </Tippy>
                        <Tippy content="#ef9b1d" placement="left">
                            <button className={styles.button + " " + styles.buttonYellow}
                                    ref={this.btnYellow} data-hex={defaultColors[2]}/>
                        </Tippy>
                        <Tippy content="#21bb85" placement="left">
                            <button className={styles.button + " " + styles.buttonGreen}
                                    ref={this.btnGreen} data-hex={defaultColors[3]}/>
                        </Tippy>

                        {/*<div className={styles.sep}/>*/}
                        <div className="panelSlider">
                            <div className="cursorDemo">
                                <div className="cursorCircle" ref={this.cursorCircle}/>
                            </div>
                            <input type="range" min="1" max="100" defaultValue={50}
                                   ref={this.sliderColor}
                                   className="slider" id="colorRange"
                                   onChange={(event) => colorRangeChange(event)}
                            />
                        </div>
                        <div className={styles.sep}/>

                        <div className={styles.btnRow}>
                            <Tippy content="Eraser" placement="left">
                                <button className={styles.btnErase} data-current={false} ref={this.btnErase}/>
                            </Tippy>

                            <Tippy content="Undo" placement="left">
                                <button className={styles.btnUndo} ref={this.btnUndo}/>
                            </Tippy>

                        </div>

                        {<div className={styles.sep}/>}
                        <div className="smHide">
                            <Tippy content="Play" placement="left">
                                <button className={styles.btnPlay} ref={this.btnPlay}/>
                            </Tippy>
                        </div>
                        <div className="smHide">
                            <Tippy content="Download as Image" placement="left">
                                <button className={styles.btnSave} ref={this.btnSave}/>
                            </Tippy>
                        </div>
                        <div className="smHide">
                            <div className={styles.sep}/>
                        </div>

                        <Tippy content="Export Sketch Data" placement="left">
                            <button className={styles.btnExport} ref={this.btnExport}/>
                        </Tippy>
                        <div className="smHide">
                            <Tippy content="Import Sketch Data" placement="left">
                                <button className={styles.btnImport} ref={this.btnImport}/>
                            </Tippy>
                        </div>

                        {/* Secret File Input */}
                        <input type="file" className={styles.fileInput} ref={this.importRef} accept="application/json"/>

                        <div className="smHide">
                            <div className={styles.sep}/>

                            <Tippy content="Previous Sketch" placement="left">
                                <button className={styles.btnPrev} ref={this.btnPrev}/>
                            </Tippy>
                            <Tippy content="Next Sketch" placement="left">
                                <button className={styles.btnNext} ref={this.btnNext}/>
                            </Tippy>

                            {/*<div className={styles.sep}/>*/}

                            <Tippy content="Random Sketch" placement="left">
                                <button className={styles.btnRandom} ref={this.btnRandom}/>
                            </Tippy>
                        </div>


                        <Tippy content="Clear the Canvas!" placement="left">
                            <button className={styles.btnClear} ref={this.btnClear}/>
                        </Tippy>


                    </div>
                    <div className="draw-cont" ref={this.renderRef}></div>
                    <div className="bottomNav">
                        <h5>DRAWINGS:</h5>
                        <nav>
                            {this.createNavLinks()}
                        </nav>
                        <select
                            className="selectSmall"
                            value={imgId}
                            onChange={(e) => {
                                window.location = "/?imgid=" + e.target.value;
                            }}
                        >
                            {this.createSelectItems()}
                        </select>

                    </div>
                </div>
            </div>
        );
    }
}

class line {
    points = [];
    hex;
    weight;
    index;
    count = 0;

    constructor(_index, _hex, _weight) {
        this.index = _index;
        this.hex = _hex;
        this.weight = _weight;
    }

    addPoint(x, y) {
        this.count++;
        this.points.push([x, y]);
    }
}


export default Sketch;