/** Config STARTs */
const config = {
    networkType: 'local',
    networks: {
        local: {
            /** Local */
            contract: 'YOUR-LOCAL-CONTRACT-ADDRESS',
            provider: 'http://127.0.0.1:8545',
        },
        testnet: {
            /** Test net */
            contract: 'YOUR-TESTNET-CONTRACT-ADDRESS',
            provider: 'https://goerli.infura.io/v3/xxxxxxxxxx',
        },
        mainnet: {
            /** Main net */
            contract: 'YOUR-MAINNET-CONTRACT-ADDRESS',
            provider: 'https://mainnet.infura.io/v3/xxxxxxxxxx',

        }
    }
};
config.contract = config.networks[config.networkType].contract;
config.provider = config.networks[config.networkType].provider;
const isLocal = config.networkType === 'local';
/** END of Config */

/** Libs */
require('dotenv').config()
const fs = require("fs");

/** Server Sets */
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

/** Enable All CORS Requests*/
app.use(cors())
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(express.json({limit: '50mb'}));

/** Web3 */
const Web3 = require("web3");
const abi = require("./web3/abi.json");
const provider = new Web3.providers.HttpProvider(config.provider)
const web3 = new Web3(provider);
const nftContract = new web3.eth.Contract(abi, config.contract);
const getTS = async () => {
    return nftContract
        .methods
        .totalSup()
        .call()
        .then((result) => {
            return Number(result);
        });
};
const getHash = async (tokenId) => {
    return nftContract
        .methods.hashes(tokenId).call()
        .then((result) => {
            return result;
        });
};

/** S3 - Space */
const AWS = require('aws-sdk');
// This will load all your environment variables from env file into your process
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    region: "FRA1",
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
    }
});

/** App libs */
const {draw} = require("./lib/renderCanvas");
const {createMetadata} = require("./lib/metadata");

/** Mint Query */
app.post('/mint', async (request, response) => {
    let ret = "OK";
    let hash = "";
    let getData = request.body;
    //console.log('Got body:', request.body);
    if (
        getData.hasOwnProperty("imgid") &&
        getData.hasOwnProperty("lines") &&
        getData.imgid > 0 &&
        getData.lines.length > 0
    ) {
        hash = await getRandomID();
        let data = JSON.stringify(getData);
        let filePath = "./cache/json-data/" + hash + ".json";
        fs.writeFileSync(filePath, data);
        if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath);
            s3.putObject({
                Key: "json-data/" + hash + ".json",
                Bucket: process.env.DO_SPACES_NAME, Body: file, ACL: "public-read"
            }, (err, data) => {
                if (err) {
                    console.log("Failed to upload data file!!!");
                    console.log(err);
                    ret = "Failed to upload data file!";
                }
            });
        } else {
            ret = "Failed to create data file!";
        }
    } else {
        ret = "Incoming data is incorrect!";
    }
    response
        .setHeader('Content-Type', 'application/json')
        .status(200)
        .end(JSON.stringify({res: ret, hash: hash}));
});

/** Get HTML NFT */
app.get('/html/:hash\.html', async (req, res) => {
    let hash = req.params.hash;
    if (hash >= 2586420 && hash <= 3586420) {
        let filePath = null;
        const pathKey = "html";
        const htmlFileName = hash.toString() + '.html';
        const htmlFileKey = pathKey + "/" + htmlFileName;
        const htmlLocalPath = "./cache/" + htmlFileKey;

        if (fs.existsSync(htmlLocalPath)) {
            filePath = htmlLocalPath;
        } else {
            // Json Data var ise işleme devam et
            let jsonFileKey = "json-data/" + hash + ".json";
            if (await getLocalOrFromS3(jsonFileKey)) {
                // S3'de Html var mı?
                if (await getLocalOrFromS3(htmlFileKey)) {
                    filePath = htmlLocalPath;
                } else {
                    // Html yok. Yarat ve s3'e yükle
                    const workData = fs.readFileSync("./cache/" + jsonFileKey);
                    const prototype = fs.readFileSync('./lib/prototype.html', 'utf8');
                    const p5min = fs.readFileSync('./lib/p5.min.js', 'utf8');
                    let html = prototype.replaceAll("__DATAHERE__", workData);
                    html = html.replaceAll("__P5HERE__", p5min);
                    html = html.replaceAll("__APIBASEHERE__", process.env.API_BASE);
                    fs.writeFileSync(htmlLocalPath, html);
                    if (fs.existsSync(htmlLocalPath)) {
                        filePath = htmlLocalPath;
                        await setFileToS3(htmlFileKey);
                    }
                }
            }
        }
        if (filePath) {
            try {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, User-Agent, X-Requested-With');
                res.setHeader('Access-Control-Expose-Headers', "Content-Range, X-Chunked-Output, X-Stream-Output");
                res.type('.html');
                res.set({'Content-Type': 'text/html'});
                res.set('Cache-control', 'public, max-age=300');
                fs.readFile(filePath,
                    {encoding: 'utf-8'},
                    (error, fileContent) => {
                        if (error) {
                            res.status(500).send(error);
                        } else {
                            res.send(fileContent);
                            res.end();
                        }
                    });
            } catch (error) {
                console.log("HTML SEND ERROR!!!");
                console.log(error);
                res.status(500).send(error);
            }
        } else {
            res.status(404).send("Not Found!");
        }
    } else {
        res.status(400).send('Bad request!')
    }
});

// Meta Data
app.get('/metadata/:hash\.json', async (req, res) => {
    let hash = req.params.hash;

    if (hash < 2586420 || hash > 3586420) {
        res.status(400).send('Bad request!')
    } else {
        const tokenid = await getTokenID(hash);
        if (tokenid > -1) {
            let filePath = null;
            const pathKey = "json-meta";
            const metaFileName = hash.toString() + '.json';
            const metaFileKey = pathKey + "/" + metaFileName;
            const metaLocalPath = "./cache/" + metaFileKey;

            if (fs.existsSync(metaLocalPath)) {
                filePath = metaLocalPath;
            } else {
                // Json Data var ise işleme devam et
                let jsonFileKey = "json-data/" + hash + ".json";

                if (await getLocalOrFromS3(jsonFileKey)) {
                    // S3'de JSON var mı?
                    if (await getLocalOrFromS3(metaFileKey)) {
                        filePath = metaLocalPath;
                    } else {
                        // META JSON yok. Yarat ve s3'e yükle
                        const workData = fs.readFileSync("./cache/" + jsonFileKey);
                        const json = await createMetadata(hash, tokenid, JSON.parse(workData));
                        let data = JSON.stringify(json);
                        fs.writeFileSync(metaLocalPath, data);
                        if (fs.existsSync(metaLocalPath)) {
                            filePath = metaLocalPath;
                            await setFileToS3(metaFileKey);
                        }
                    }
                }
            }

            if (filePath) {
                try {
                    res.type('.json');
                    res.set({'Content-Type': 'application/json'});
                    res.set('Cache-control', 'public, max-age=300');
                    fs.readFile(filePath,
                        {encoding: 'utf-8'},
                        (error, fileContent) => {
                            if (error) {
                                res.status(500).send(error);
                            } else {
                                res.send(fileContent);
                                res.end();
                            }
                        });
                } catch (error) {
                    console.log("META SEND ERROR!!!");
                    console.log(error);
                    res.status(500).send(error);
                }
            } else {
                res.status(404).send("Not Found!");
            }


        } else {
            res.status(400).send('Bad request!')
        }
    }
});

/** Get Asset Images */
app.get('/assets/:season/:imgname\.png', async (req, res) => {
    const imgname = req.params.imgname;
    const season = req.params.season;
    const pngLocalPath = "./assets/" + season + "/" + imgname + ".png";
    if (fs.existsSync(pngLocalPath)) {
        try {
            res.type('.png');
            res.set({'Content-Type': 'image/png'});
            res.set('Cache-control', 'public, max-age=300');
            fs.readFile(pngLocalPath,
                {},
                (error, fileContent) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        res.send(fileContent);
                        res.end();
                    }
                });
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(404).send("Not Found!");
    }
});

/** Get NFT Images */
app.get('/image/:type/:hash\.png', async (req, res) => {
    let filePath = null,
        workData;
    const type = req.params.type,
        hash = req.params.hash,
        types = ['thumb', 'low', 'high', 'orj'];

    if (hash >= 2586420 && hash <= 3586420 && types.includes(type)) {
        const pathKey = "img-" + type;
        const pngFileName = hash.toString() + '.png';
        const pngFileKey = pathKey + "/" + pngFileName;
        const pngLocalPath = "./cache/" + pngFileKey;

        if (fs.existsSync(pngLocalPath)) {
            filePath = pngLocalPath;
        } else {
            // Json Data var ise işleme devam et
            let jsonFileKey = "json-data/" + hash + ".json";
            if (await getLocalOrFromS3(jsonFileKey)) {

                // Png var mı?
                if (await getLocalOrFromS3(pngFileKey)) {
                    filePath = pngLocalPath;
                } else {
                    // Png yok. Yarat ve s3'e yükle
                    const rawdata = fs.readFileSync("./cache/" + jsonFileKey);
                    workData = JSON.parse(rawdata);

                    if (type === "thumb") {
                        try {
                            filePath = await draw(hash, pathKey, workData, 350);
                            await setFileToS3(pngFileKey);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    if (type === "low") {
                        try {
                            filePath = await draw(hash, pathKey, workData, 600);
                            await setFileToS3(pngFileKey);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    if (type === "high") {
                        try {
                            filePath = await draw(hash, pathKey, workData, 1200);
                            await setFileToS3(pngFileKey);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    if (type === "orj") {
                        try {
                            filePath = await draw(hash, pathKey, workData, 3000);
                            await setFileToS3(pngFileKey);
                        } catch (error) {
                            console.log(error);
                            //res.status(500).send(error);
                        }
                    }
                }
            }
        }

        if (filePath) {
            try {
                res.type('.png');
                res.set({'Content-Type': 'image/png'});
                res.set('Cache-control', 'public, max-age=300');
                fs.readFile(filePath,
                    {},
                    (error, fileContent) => {
                        if (error) {
                            res.status(500).send(error);
                        } else {
                            res.send(fileContent);
                            res.end();
                        }
                    });
            } catch (error) {
                res.status(500).send(error);
            }
        } else {
            res.status(404).send("Not Found!");
        }
    } else {
        res.status(400).send('Bad request!')
    }
});

app.get('/get-token/:hash', async (req, response) => {
    const hash = req.params.hash;
    const token = await getTokenID(hash)
    response
        .setHeader('Content-Type', 'application/json')
        .status(200)
        .end(JSON.stringify({res: "OK", token: token}));
});

/** Favicon 204 No content */
app.get('/favicon.ico', (req, res) => res.status(204).send('No content'));

/** Server Start */
app.listen(3000, () => console.log(`Draw'n mint app listening on port 3000!`));

/** Get file from S3 */
async function getLocalOrFromS3(fileKey) {
    /** If local, do not upload to S3 */
    if (isLocal) {
        return fs.existsSync("./cache/" + fileKey);
    }

    /** Live Action */
    const localPath = "./cache/" + fileKey;
    const getObject = async function () {
        return new Promise(function (success, reject) {
            s3.getObject(
                {Bucket: process.env.DO_SPACES_NAME, Key: fileKey},
                function (error, data) {
                    if (error) {
                        reject(error);
                    } else {
                        success(data);
                    }
                }
            );
        });
    }
    if (fs.existsSync(localPath)) {
        return true;
    } else {
        return getObject()
            .then(function (data) {
                fs.writeFileSync(localPath, data.Body, {encoding: 'binary'});
                return true;
            })
            .catch(function (err) {
                //console.log(err);
                return false;
            });
    }
}

/** Download From S3 */
async function setFileToS3(fileKey) {
    /** If local, do not get from S3 */
    if (isLocal) {
        return false;
    }

    /** Live Action */
    const filePath = "./cache/" + fileKey,
        file = fs.readFileSync(filePath);
    s3.putObject({
        Key: fileKey, Bucket: process.env.DO_SPACES_NAME, Body: file, ACL: "public-read"
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
    });
}

/** Get TokenID from Hash */
async function getTokenID(hash) {
    let dataRaw, dataJson;
    const metaFileName = 'hashes.json';
    const metaLocalPath = "./cache/" + metaFileName;

    // Get File From Cache
    if (await getLocalOrFromS3(metaFileName)) {
        dataRaw = fs.readFileSync(metaLocalPath);
        dataJson = JSON.parse(dataRaw);
    } else {
        dataJson = {};
    }

    // Is hash exist ?
    if (dataJson.hasOwnProperty(hash)) {
        return Number(dataJson[hash]);
    }

    // Create new
    // Get supply
    const TS = await getTS();
    const currentTokens = Object.values(dataJson);
    // console.log("TS:" + TS + "\n");
    // console.log("5) Get Supply start\n");
    for (let i = 0; i < TS; i++) {
        if (!currentTokens.includes(i)) {
            dataJson[await getHash(i)] = i;
            //console.log("get token from contract (" + i.toString() + ")\n");
        }
    }

    //console.log(dataJson);

    // Save json
    let data = JSON.stringify(dataJson);
    fs.writeFileSync(metaLocalPath, data);

    // Send to S3
    await setFileToS3(metaFileName);

    // Return token id
    if (dataJson.hasOwnProperty(hash)) {
        return Number(dataJson[hash]);
    }
    return -1;
}

/** Get Random ID */
async function getRandomID() {
    let dataRaw, dataJson;
    const metaFileName = 'randomids.json';
    const metaLocalPath = "./cache/" + metaFileName;

    // Get File From Cache
    if (await getLocalOrFromS3(metaFileName)) {
        dataRaw = fs.readFileSync(metaLocalPath);
        dataJson = JSON.parse(dataRaw);
    } else {
        dataJson = {};
    }

    const currentIds = Object.values(dataJson);
    let newRandId;
    do {
        newRandId = 2586420 + Math.floor(Math.random() * 1000000);
    } while (currentIds.includes(newRandId));
    currentIds.push(newRandId);

    const newObj = Object.assign({}, currentIds);

    // Save json
    let data = JSON.stringify(newObj);
    fs.writeFileSync(metaLocalPath, data);

    // Send to S3
    await setFileToS3(metaFileName);

    return newRandId;
}
