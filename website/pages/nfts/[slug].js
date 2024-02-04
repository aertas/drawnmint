import {useRouter} from 'next/router'
import Head from "next/head";
import styles from "../../styles/nftlist.module.scss";
import conf from "../../next.config";
import React, {useEffect, useState, useCallback} from "react";
import NavLinksSmall from "../components/nav-links-small";
import Footer from "../components/footer";
import {getName, getStory} from "../../dapp/imgs";
import {getHash, getTotalSupply} from "../../dapp/contractIntereact";

let lineCount, pointCount, dominantColor, usages = [];

export default function NftDetail() {
    const router = useRouter();
    const [metaData, setMetaData] = useState();
    const [hash, setHash] = useState();
    const [apiStat, setApiStat] = useState(0);
    const [TS, setTS] = useState(-1);
    const [prevHash, setPrevHash] = useState(-1);
    const [nextHash, setNextHash] = useState(-1);
    const [tokenId, setTokenId] = useState(-1);
    const [iframeKeyValue, setIframeKeyValue] = useState(0);
    const [isModal, setIsModal] = useState(false);
    const contentClassname = isModal ? `${styles.frameContFullScreen} ${styles.frameCont}` : styles.frameCont;
    const iframeClassname = isModal ? `${styles.iframeFullScreen}` : styles.iframe;

    const escFunction = useCallback((event) => {
        if (event.key === "Escape") {
            setIsModal(false);
        }
    }, []);

    const callAPI = async () => {
        try {
            const res = await fetch(conf.network.apiUrl + "/metadata/" + hash + ".json");
            let data = await res.json();
            setMetaData(data);

            for (let i = 0; i < data.attributes.length; i++) {
                if (data.attributes[i]["trait_type"] === "Line Count") {
                    lineCount = Number(data.attributes[i]["value"]);
                }
                if (data.attributes[i]["trait_type"] === "Point Count") {
                    pointCount = Number(data.attributes[i]["value"]);
                }
                if (data.attributes[i]["trait_type"] === "Dominant Color") {
                    dominantColor = data.attributes[i]["value"];
                }
                if (data.attributes[i]["display_type"] === "boost_percentage") {
                    let name = data.attributes[i]["trait_type"];
                    usages.push({
                        name: name,
                        hex: name.replace(" Usage", ""),
                        value: Number(data.attributes[i]["value"]),
                    })
                }
            }
            setApiStat(1);
        } catch (err) {
            console.log(err);
            setApiStat(2);
        }
    };

    const tokenIdUpdate = async () => {
        try {
            const res = await fetch(conf.network.apiUrl + "/get-token/" + hash);
            let data = await res.json();
            if (data.res === "OK") {
                if (data.token > -1) {
                    setTokenId(data.token);
                    setApiStat(1);
                } else {
                    setApiStat(2);
                }
            } else {
                setApiStat(2);
            }
        } catch (err) {
            console.log(err);
            setApiStat(2);
        }
    }

    useEffect(() => {
        if (!router.isReady) return;
        let slug = router.query.slug;
        if (slug) {
            setHash(slug);
        }
        if (hash && tokenId < 0) {
            tokenIdUpdate();
        }
        if (tokenId > -1) {
            callAPI();
        }
        if (TS === -1) {
            getTotalSupply().then((res) => setTS(Number(res)));
        }
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [router.isReady, hash, tokenId]);

    const Iframe = () => {
        if (hash) {
            return (
                <div id="frameCont" className={contentClassname}>
                    <button className={styles.toggleModal}
                            onClick={() => setIsModal(!isModal)}/>
                    <button className={styles.reDraw}
                            onClick={() => setIframeKeyValue(iframeKeyValue + 1)}/>
                    <iframe className={iframeClassname} src={conf.network.apiUrl + "/html/" + hash + ".html"}/>
                </div>
            )
        } else {
            return (
                <div id="frameCont" className={contentClassname}/>
            )
        }
    }

    const PrevNft = () => {
        if (TS === -1 || tokenId === -1 || tokenId === 0 || prevHash === -2) {
            return <div/>;
        }
        const prevToken = tokenId - 1;
        if (prevHash === -1) {
            try {
                getHash(prevToken)
                    .then((res) => {
                        setPrevHash(Number(res.hash));
                    });
            } catch (err) {
                setPrevHash(-2);
            }
        }
        if (prevHash > 1000) {
            return <div>
                <a className={styles.cardlink + " decorated inline"} href={"/nfts/" + prevHash}>
                    <img className={styles.cardimg}
                         src={conf.network.apiUrl + "/image/low/" + prevHash + ".png"} alt=""/>
                    <span className="decorated inline">#{pad(prevToken, 4)}</span>
                </a>
            </div>;
        }
        return <></>;
        // const [nextHash, setNextHash] = useState(-1);
    }
    const NextNft = () => {
        if (TS === -1 || tokenId === -1 || (TS > 0 && (TS - 1) === tokenId)) {
            return <div/>;
        }
        const nextToken = tokenId + 1;
        if (nextHash === -1) {
            try {
                getHash(nextToken)
                    .then((res) => {
                        setNextHash(Number(res.hash));
                    });
            } catch (err) {
                setNextHash(-2);
            }
        }
        if (nextHash > 1000) {
            return <div style={{textAlign: "right"}}>
                <a className={styles.cardlink + " decorated inline"} href={"/nfts/" + nextHash}>
                    <span className="decorated inline">#{pad(nextToken, 4)}</span>
                    <img className={styles.cardimg}
                         src={conf.network.apiUrl + "/image/low/" + nextHash + ".png"} alt=""/>
                </a>
            </div>;
        }
        return <></>;
    }

    const MainContext = () => {

        if (apiStat === 0) {
            return (
                <div className={styles.big + " col-12"}><h3>Please Wait.</h3></div>
            )
        }
        if (apiStat === 2) {
            return (
                <div className={styles.big + " col-12"}><h3>Bad Request</h3></div>
            )
        }
        if (apiStat === 1) {
            if (!metaData) {
                return (
                    <div className={styles.big + " col-12"}><h3>Please Wait...</h3></div>
                )
            }
            return (
                <div className="container">
                    <div className="row">
                        <div className="col-7">
                            <Iframe key={iframeKeyValue} thisHash={hash}/>
                            <div className="row">
                                <div className="col-12" style={{textAlign: "center"}}>
                                    <a className="decorated" target="_blank" rel="noreferrer"
                                       href={conf.network.apiUrl + "/image/orj/" + hash + ".png"}>
                                        <img src="/images/save.png" width={32} alt=""
                                             style={{background: "#b9cd77", padding: "8px", borderRadius: "100%"}}/>
                                        Download Original Size</a>
                                </div>
                            </div>
                        </div>
                        <div className="col-5">
                            <h2 className={styles.blueHead}>{metaData.name}</h2>
                            <p className={styles.story}>
                                <strong>{getName(metaData.sketchid)} </strong>
                                {getStory(metaData.sketchid)}
                            </p>
                            <div className="mainwrapper">
                                <div className="itemwrapper">
                                    <div className={styles.th}>Dominant Color</div>
                                    <div className={styles.td + " " + styles.tdbg}
                                         style={{background: dominantColor}}>{dominantColor}</div>
                                </div>
                                <div className="itemwrapper">
                                    <div className={styles.th}>Line Count</div>
                                    <div className={styles.td}>{lineCount}</div>
                                </div>
                                <div className="itemwrapper">
                                    <div className={styles.th}>Point Count</div>
                                    <div className={styles.td}>{pointCount}</div>
                                </div>

                                <h3 className={styles.greenHead}
                                    style={{fontSize: "20px", marginTop: "18px"}}>Balance</h3>
                                {usages.map(row => (
                                    <div key={row.hex} className="itemwrapper">
                                        <div className={styles.th} style={{color: row.hex}}>
                                            {row.hex}
                                        </div>
                                        <div className={styles.td + " " + styles.tdbg}
                                             style={{background: row.hex}}>{row.value}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="row" style={{paddingTop: "2rem"}}>
                                <div className="col-6">
                                    <a className="decorated inline" target="_blank" rel="noreferrer"
                                       href={conf.network.seeOnOpensea +
                                           conf.network.contractAddress + "/" + tokenId}>
                                        <img src="/images/social/opensea.png" width={24} alt=""/>
                                        See on Opensea</a>
                                </div>
                                <div className="col-6" style={{textAlign: "right"}}>
                                    <a className="decorated inline" target="_blank" rel="noreferrer"
                                       href={conf.network.seeOnEtherscan +
                                           conf.network.contractAddress + "/" + tokenId}>
                                        <img src="/images/social/etherscan.png" width={24} alt=""/>
                                        See on Etherscan</a>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={styles.subNav + " col-12"}>
                            <div className="row">
                                <div className="col-4"><PrevNft/></div>
                                <div className="col-4" style={{textAlign: "center"}}>
                                    <a className="decorated" href="/nfts">NFTs List</a>
                                </div>
                                <div className="col-4" style={{textAlign: "right"}}><NextNft/></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    const MetaTags = () => {
        if (metaData) {
            const domain = process.env.NEXT_PUBLIC_DOMAIN;

            return (
                <Head>
                    <title>{metaData.name} | Draw`n Mint</title>
                    <meta name="description" content={metaData.name + " Draw'n Mint NFTs detail page"}/>
                    <link rel="icon" href="/favicon.ico"/>
                    <meta property="twitter:url" content={`https://${domain}/nfts/${hash}`}/>
                    <meta name="twitter:title" content={metaData.name + " | Draw`n Mint"}/>
                    <meta name="twitter:description" content={metaData.name + " Draw'n Mint NFTs detail page"}/>
                    <meta name="twitter:image" content={conf.network.apiUrl + "/image/low/" + hash + ".png"}/>
                </Head>
            )
        }

        return (
            <Head>
                <title>Nft Detail | Draw`n Mint</title>
                <meta name="description" content="Draw'n Mint NFTs detail page"/>
                <meta name="twitter:title" content="Nft Detail | Draw`n Mint"/>
                <meta name="twitter:description" content="Draw'n Mint NFTs detail page"/>
            </Head>
        )
    }

    return (
        <div>
            <MetaTags/>
            <main className={styles.container}>
                <div className="container"
                     style={{marginBottom: "1rem", paddingBottom: "0", borderBottom: "1px solid #555"}}>
                    <div className="row">
                        <div className="col-3" style={{textAlign: "center"}}>
                            <a href="/"><img src="/images/logo-white.png" alt="LOGO" height={90}/></a>
                        </div>
                        <div className="col-6" style={{textAlign: "center"}}>
                            <h1 className={styles.yellowHead}>Draw&#39;n MINT</h1>
                            <strong className={styles.greenStrong}>NFT's Detail</strong>
                        </div>
                        <div className={styles.topLinks + " col-3"}>
                            <NavLinksSmall activeNo={3}/>
                        </div>
                    </div>
                </div>
                <MainContext/>
            </main>
            <Footer/>
        </div>
    )
}


function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}
