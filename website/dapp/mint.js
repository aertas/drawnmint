import React, {useEffect, useState} from 'react'
import conf from "/next.config.js"
import styles from '../styles/mint.module.scss'
import Countdown from "../pages/components/countdown";
import Swal from 'sweetalert2'

const Web3 = require('web3');
import {
    checkWhiteList,
    getImgMintCount,
    getProof,
    getStatus,
    getTotalSupply,
    isMinted,
    publicMint
} from "./contractIntereact";
import {connectWallet, getCurrentWalletConnected} from "./walletInteract";
import {Toaster} from 'react-hot-toast';
import {getimgs, getStory} from "./imgs";
import SocialLinks from "../pages/components/social-links";

const imgs = getimgs();


let initialized = false;

export default function Mint({imgID}) {
    const [price, setPrice] = useState(conf.publicPrice);
    const [TS, setTS] = useState(-1);
    const [imgSup, setimgSup] = useState(-1);
    const [status, setStatus] = useState(0);
    const [walletExist, setwalletExist] = useState(false);
    const [isWalletConnected, setIsWalletConnected] = useState(0);
    const [walletAddress, setWalletAddress] = useState("");

    useEffect(() => {
        getStatus().then((res) => setStatus(Number(res)));
        getTotalSupply().then((res) => setTS(Number(res)));

        if (imgID > 0) {
            getImgMintCount(imgID).then((res) => setimgSup(Number(res)));
        }

        if (imgSup > -1 && TS > -1 && status > 0 && imgID > 0) {
            // Drop Active
            if (status === 2) {
                if (window.ethereum) {
                    const prepare = async () => {
                        const walletResponse = await getCurrentWalletConnected();
                        //console.log(Number(window.ethereum.chainId), Number(conf.network.chainId));
                        if (Number(window.ethereum.chainId) === Number(conf.network.chainId)) {
                            if (walletResponse.address) {
                                setWalletAddress(walletResponse.address);
                                setIsWalletConnected(1);
                                document.getElementById("mintExp").innerHTML = "";
                                await calcPrice();
                            }
                        } else {
                            setWalletAddress("");
                            setIsWalletConnected(2);
                            document.getElementById("mintExp").innerHTML = "Unsupported chain";
                        }
                        addWalletListener();
                        if (!initialized) {
                            initialized = true;
                        }
                    }
                    prepare();
                    setwalletExist(true);

                } else {
                    document.getElementById("mintExp").innerHTML = "Please Install Metamask";
                    setwalletExist(false);
                }
            }
        }

        return () => {
            if (initialized) {

            }
        }
    });

    const reloadPage = () => {
        Swal.fire({
            title: "RELOADING",
            html: "<p>Please Wait</p>",
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
        })
        Swal.showLoading();
        location.reload();
    }
    const addWalletListener = () => {
        if (window.ethereum) {
            window.ethereum.on("chainChanged", async (chainId) => {
                if (Number(chainId) === Number(conf.network.chainId)) {
                    setWalletAddress(window.ethereum.selectedAddress);
                    document.getElementById("mintExp").innerHTML = "";
                    await calcPrice();
                } else {
                    setWalletAddress("");
                    document.getElementById("mintExp").innerHTML = "Unsupported chain";
                }
                reloadPage();
            });
            window.ethereum.on('message', () => {
                document.getElementById("connectbutton").disabled = false;
            });

            window.ethereum.on("accountsChanged", async (accounts) => {
                setWalletAddress("");
                reloadPage();
            });

            window.ethereum.on('networkChanged', function (networkId) {
                reloadPage();
            });
        }
    };
    const connectFunction = async () => {
        if (window.ethereum) {
            document.getElementById("connectbutton").disabled = true;
            const walletResponse = await connectWallet();
            let _chainId = Number(window.ethereum.chainId);
            if (_chainId === Number(conf.network.chainId)) {
                setWalletAddress(walletResponse.address);
                await calcPrice();
                document.getElementById("mintExp").innerHTML = "";
                document.getElementById("connectbutton").disabled = false;
            } else {
                document.getElementById("mintExp").innerHTML = "Unsupported chain";
                document.getElementById("connectbutton").disabled = false;
                setWalletAddress("")

                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{chainId: Web3.utils.toHex(conf.network.chainId)}]
                    });
                } catch (err) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (err.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainName: conf.network.chainName,
                                    chainId: Web3.utils.toHex(conf.network.chainId),
                                    nativeCurrency: {
                                        name: conf.network.name,
                                        symbol: conf.network.symbol,
                                        decimals: 18
                                    },
                                    rpcUrls: [conf.network.rpc],
                                    blockExplorerUrls: [conf.network.blockExplorerUrl],
                                }
                            ]
                        });
                    }
                }

                //document.getElementById("mintGroup").innerHTML= ""
            }
        }
    }
    const calcPrice = async () => {
        let isInWl = await checkWhiteList(walletAddress);
        if (isInWl) {
            const isAddrsMinted = await isMinted(walletAddress);
            if (!isAddrsMinted) {
                setPrice(conf.wlPrice)
            }
        }
        //console.log("price:", price);
    }

    const mintFunction = async () => {
        const disableMintBtn = () => {
            document.getElementById("mintButton").disabled = true;
        }
        const enableMintBtn = () => {
            document.getElementById("mintButton").disabled = false;
        }
        disableMintBtn();

        if (typeof window !== 'undefined') {
            let getWorkData, hasData = false;
            const dataSaveKey = localStorage.getItem("dataSaveKey");
            const allData = localStorage.getItem(dataSaveKey);
            if (allData && allData !== "undefined") {
                getWorkData = JSON.parse(allData);
                hasData = getWorkData.lines.length > 0;
                //console.log(getWorkData.lines.length);
            }


            /** Mint process */
            async function postData(url = '', data = {}) {
                return await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
                    .then((response) => {
                        return response;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        return false;
                    });
            }

            async function getresponse(data) {
                //console.log(data);
                postData(conf.network.apiUrl + "/mint", data)
                    .then(async res => {

                        if (res === false) {
                            Swal.update({
                                title: "Something is wrong!",
                                html: "The server is unreachable",
                                showCancelButton: false,
                                showConfirmButton: true,
                                cancelButtonText: 'Close',
                                icon: 'error',
                            })
                            Swal.hideLoading();

                        } else {
                            res = await res.json();
                            if (res.res === "OK") {
                                Swal.update({
                                    title: "WAITING FOR API",
                                    imageUrl: "/draws/" + imgID + ".png",
                                    imageWidth: 250,
                                    imageAlt: 'prgrs',
                                })
                                Swal.showLoading();
                                let proof = await getProof(walletAddress);
                                let mintRes = await publicMint(imgID, res.hash, proof, price);
                                if (mintRes) {
                                    let tweetText = encodeURIComponent("let's paint! 👁️\n\n" +
                                        "I painted and minted my unique work of art.\n\n" +
                                        "it's your turn!\n\n" +
                                        "Draw'n Mint\n" +
                                        "See my painting:\n" +
                                        conf.network.currentUrl + "/nfts/" + res.hash);
                                    Swal.update({
                                        title: "CONGRATULATIONS!",
                                        html: "<p>Successfully minted 🥳<br>╰(*°▽°*)╯</p>" +
                                            "<a href='" + conf.network.currentUrl + "/nfts/" + res.hash +
                                            "' class='decorated' target='_blank'>View your NFT</a>",
                                        imageUrl: conf.network.apiUrl + "/image/low/" + res.hash + ".png",
                                        imageAlt: '',
                                        imageWidth: 250,
                                        showCancelButton: true,
                                        showConfirmButton: true,
                                        confirmButtonText: '<a href="https://twitter.com/intent/tweet?text=' + tweetText + '" target="_blank">Tweet</a>',
                                        cancelButtonText: 'OK',
                                    })
                                    await getStatus().then((res) => setStatus(Number(res)));
                                    await getTotalSupply().then((res) => setTS(Number(res)));
                                    await getImgMintCount(imgID).then((res) => setimgSup(Number(res)));
                                    setPrice(conf.publicPrice);
                                    enableMintBtn();
                                    Swal.update({
                                        allowOutsideClick: true,
                                        allowEscapeKey: true,
                                        showConfirmButton: true,
                                    })
                                    Swal.hideLoading();
                                } else {
                                    enableMintBtn();
                                    Swal.close();
                                }
                            } else {
                                Swal.close();
                                Swal.fire(
                                    "Something is wrong!",
                                    res.res,
                                    'error'
                                )
                                enableMintBtn();
                            }
                        }
                        //console.log(res);

                    })
            }

            Swal.fire({
                title: "PLEASE WAIT",
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: (toast) => {
                    // Swal.close();
                    getresponse({
                        imgid: getWorkData.imgId,
                        seasonid: conf.seasonId,
                        lines: getWorkData.lines
                    });
                    Swal.update({
                        title: "CHECKING DRAW DATA",
                    })
                    Swal.showLoading();
                }
            })

        } else {
            Swal.fire(
                'A technical fault has occurred!',
                'Please try again with another browser on your computer.',
                'error'
            )
            enableMintBtn();
        }
    }

    const mintNow = async () => {
        let getWorkData, hasData = false;
        const dataSaveKey = localStorage.getItem("dataSaveKey");
        const allData = localStorage.getItem(dataSaveKey);
        if (allData && allData !== "undefined") {
            getWorkData = JSON.parse(allData);
            hasData = getWorkData.lines.length > 0;
            //console.log(getWorkData.lines.length);
        }

        if (!hasData) {
            /** Draw check */
            Swal.fire(
                '',
                'Not enough drawing to Mint!',
                'warning'
            )
        } else {
            Swal.fire({
                title: "MINTING!",
                text: "Are you sure you want to continue?",
                showCancelButton: true,
                confirmButtonText: 'Yes! LFG🚀',
                cancelButtonText: 'nope',
                //imageUrl: "/draws/" + imgID + ".png",
                imageUrl: document.getElementById('defaultCanvas0').toDataURL(),
                imageWidth: 250,
            }).then(async (confirm) => {
                if (confirm.isConfirmed) {
                    await mintFunction()
                }
            });
        }
    }

    /** Html Parts */
    const DrwaNMintLogo = () => {
        return <div className={styles.logoCont}>
            <img src="/images/logo-white.png" alt="LOGO" width={220}/>
            <h1>Draw&#39;n MINT</h1>
            <p>Season One</p>
        </div>
    }
    const MDLinks = () => {
        return <>
            <a className="decorated inline" href="/how-it-works">How?</a>
            <a className="decorated inline" href="/nfts">NFTs</a>
            <a className="decorated inline" href="/about-dev">Dev</a>
        </>;
    }
    const MintNav = () => {
        return <>
            <a className="decorated" href="how-it-works">How It Works?</a>
        </>;
    }
    const NftListLink = () => {
        return <a className="decorated" href="/nfts">NFTs List</a>;
    }
    const AboutDev = () => {
        return <>
            <a className="decorated" href="about-dev">About Dev</a>
        </>;
    }
    const SocialIcons = () => {
        return <div>
            <SocialLinks/>
            <p style={{textAlign: "center"}}>
                @DevConcof &copy; 2024
            </p>
        </div>;
    }
    const MintPriceText = () => {
        let mintText = price > 0 ? "Mint Ξ " + price.toString() + "" : "Mint Free";
        return <span>{mintText}</span>
    }
    const MintButton = () => {
        if (walletExist) {
            if (conf.mintPerImage > imgSup) {
                if (isWalletConnected === 0) {
                    return <div className={styles.mintBtn}>
                        <button id="connectbutton" onClick={connectFunction}>Connect Metamask</button>
                        <p id="mintExp">
                            Please Connect Your Wallet
                        </p>
                    </div>
                }
                if (isWalletConnected === 1) {
                    return <div className={styles.mintBtn}>
                        <button id="mintButton" onClick={mintNow}><MintPriceText/></button>
                        <p id="mintExp"></p>
                    </div>
                }
                if (isWalletConnected === 2) {
                    return <div className={styles.mintBtn}>
                        <button id="connectbutton" onClick={connectFunction}>Change Network</button>
                        <p id="mintExp">
                            Unsupported chain
                        </p>
                    </div>
                }
            } else {

                return <div>
                    <p className={styles.pDrawSO}>"{imgs[imgID]}"<br/>SOLD OUT <br/> 🥳</p>
                    <p id="mintExp" style={{display: "none"}}></p>
                </div>
            }

        }
        return <div className={styles.mintBtn}>
            <p id="mintExp"></p>
        </div>
    }
    const DropStatus = () => {
        if (TS > -1) {
            let seasonSupply = TS - conf.startSupply;
            return <div className={styles.dropStatus}>
                <div className={styles.dropStatusTS}>
                    <strong>Total supply:</strong>
                    <span>{seasonSupply} / {conf.seasonSupply}</span>
                </div>
                <div className={styles.dropStatusTS}>
                    {/*<strong>{imgs[imgID]}'s supply:</strong>*/}
                    <strong>Image supply:</strong>
                    <span>{imgSup} / {conf.mintPerImage}</span>
                </div>
                {/*{ordinal_suffix_of(imgID)} Draw: {imgSup} / {conf.mintPerImage} <br/>*/}
            </div>
        } else {
            return <div/>
        }
    }
    const ImageName = () => {
        const onNameClick = () => {
            Swal.fire({
                title: imgs[imgID],
                html: "<p>" + '"' + imgs[imgID] + '" ' + getStory(imgID) + "</p>",
                confirmButtonText: 'Awesome!',
                imageUrl: "/draws/" + imgID + ".png",
                imageWidth: 250,
                padding: '1em',

            })
        }

        return <div className={styles.dropStatusSketchName}>
            <button onClick={onNameClick} className="decoratedBtn">"{imgs[imgID]}"</button>
        </div>
    }

    const MintContainer = () => {
        if (conf.dropActive) {
            if (status === 1) {
                return <div className={styles.mintContFlex}>
                    <DrwaNMintLogo/>
                    <div className="xlShow">
                        <ImageName/>
                    </div>
                    <Countdown/>
                    <div className="xlShow">
                        <MintNav/>
                        <NftListLink/>
                        <AboutDev/>
                    </div>
                    <div className="xlShow">
                        <SocialIcons/>
                    </div>
                    <div className="mdShow">
                        <MDLinks/>
                    </div>
                </div>
            }
            if (status === 2) {
                return <div className={styles.mintContFlex}>
                    <DrwaNMintLogo/>
                    <div className="xlShow">
                        <ImageName/>
                    </div>
                    <DropStatus/>
                    <MintButton/>
                    <div className="xlShow">
                        <MintNav/>
                        <NftListLink/>
                        <AboutDev/>
                    </div>
                    <div className="xlShow">
                        <SocialIcons/>
                    </div>
                    <div className="mdShow">
                        <MDLinks/>
                    </div>
                </div>
            }
        }
        return <div className={styles.mintContFlex}/>;
    }

    return (
        <div className={styles.mintCont}>
            <MintContainer/>
            <Toaster/>
        </div>
    )

}

