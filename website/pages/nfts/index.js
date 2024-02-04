import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import styles from '../../styles/nftlist.module.scss'
import {getHash, getTotalSupply} from "../../dapp/contractIntereact";
import NftsCard from "./nft-card";
import NavLinksSmall from "../components/nav-links-small";
import Footer from "../components/footer";

const dataSaveKey = "nftsTokenHashKey";
const getData = () => {
    if (typeof window !== 'undefined') {
        let res = localStorage.getItem(dataSaveKey);
        if (res !== null && res !== "undefined") {
            //console.log(res);
            return JSON.parse(res);
        }
        return {};
    }
    return null;
};
const setData = (saveData) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(dataSaveKey, JSON.stringify(saveData));
    }
};
let hashesData = getData(),
    checkData = hashesData;

/** Pagination */
function getUrlParams(name) {
    const url = location.href;
    name = name.replace(/\[/, "\\\[").replace(/]/, "\\\]");
    const regexS = "[\\?&]" + name + "=([^&#]*)";
    const regex = new RegExp(regexS);
    const results = regex.exec(url);
    return results == null ? null : results[1];
}

/** is Integer */
function isInt(value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
    })(parseFloat(value))
}


export default function NftsList() {
    const cardsPerPage = 16;
    const [curPage, curPageTS] = useState(-1);
    const [TS, setTS] = useState(-1);
    const [initiliazed, setInitiliazed] = useState(false);
    const [nftListIds, setNftListIds] = useState([]); // Default number of posts dislplayed

    useEffect(() => {
        // GET PAGE
        let page = Number(getUrlParams("page")) || 1;
        if (page < 0 || !page || isNaN(page) || !isInt(page)) {
            page = 1;
        }
        curPageTS(Number(page));

        // GET TS
        getTotalSupply().then((res) => setTS(Number(res)));

        if (curPage > -1 && TS > -1 && !initiliazed) {
            if (curPage > Math.ceil(TS / cardsPerPage)) {
                curPageTS(1);
                return;
            }
            let checkCount = 0;
            let checkCountMaximum;
            let startIndex = (curPage - 1) * cardsPerPage;
            let endIndex = startIndex + cardsPerPage;
            if (endIndex > TS) {
                endIndex = TS;
            }
            checkCountMaximum = endIndex - startIndex;
            //console.log("startIndex:", startIndex, "endIndex:", endIndex);

            let ar = [];
            for (let tokenId = startIndex; tokenId < endIndex; tokenId++) {
                ar.push(tokenId);
            }
            setNftListIds(ar);

            for (let tokenId = startIndex; tokenId < endIndex; tokenId++) {
                if (checkData.hasOwnProperty(tokenId.toString())) {
                    //console.log(tokenId);
                    checkCount++;
                    if (checkCount === checkCountMaximum) {
                        setInitiliazed(true);
                        hashesData = checkData;
                        setData(checkData);
                        //console.log("okok");
                        //console.log(checkData);
                    }
                } else {
                    getHash(tokenId).then((res) => {
                        checkData[res.tokenId] = res.hash;
                        checkCount++;
                        console.log("checkCount:", checkCount + "/" + TS);
                        if (checkCount === checkCountMaximum) {
                            setInitiliazed(true);
                            hashesData = checkData;
                            setData(checkData);
                        }
                    });
                }
            }
        }

        return () => {
        }
    });

    const GetCard = ({tokenId}) => {
        return <NftsCard key={tokenId} initiliazed={initiliazed}
                         tokenId={tokenId} hash={initiliazed ? hashesData[tokenId] : ""}/>;
    }

    const Pagination = () => {
        const lastPage = Math.ceil(TS / cardsPerPage);
        const prev = curPage > 1 ? (curPage - 1) : null;
        const next = curPage < lastPage ? (curPage + 1) : null;

        const PrevLink = () => prev
            ? <a href={"/nfts?page=" + prev} className="decorated inline">Previous Page</a>
            : <div/>;
        const NextLink = () => next
            ? <a href={"/nfts?page=" + next} className="decorated inline">Next Page</a>
            : <div/>;

        return <div className={styles.pagination}>
            <div className="col-4">
                <PrevLink/>
            </div>
            <div className="col-4">
                {curPage} / {lastPage}
            </div>
            <div className="col-4">
                <NextLink/>
            </div>
        </div>;
    }

    const Nfts = () => {
        if (TS > 0) {
            if (curPage > 0 && initiliazed) {
                return (
                    <div className="container">
                        <div className="row">
                            {nftListIds.map(tokenId => (
                                <GetCard key={tokenId} tokenId={tokenId}/>
                            ))}
                        </div>
                        <div className="row">
                            <Pagination/>
                        </div>
                    </div>
                )
            } else {
                return <div className="container">
                    <div className="row">
                        <div className={styles.big + " col-12"}><h3>Please Wait..</h3></div>
                    </div>
                </div>
            }
        } else if (TS === 0) {
            return <div className="container">
                <div className="row">
                    <div className={styles.big + " col-12"}><h3>There are no minted NFTs yet</h3></div>
                </div>
            </div>
        } else {
            return <div/>
        }
    }

    return (
        <div>
            <Head>
                <title>Draw`n Mint NFTs List</title>
                <meta name="description" content="Draw'n Mint NFTs list page"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.container}>
                <div className="container"
                     style={{marginBottom: "1rem", paddingBottom: "0", borderBottom: "1px solid #555"}}>
                    <div className="row">
                        <div className="col-3" style={{textAlign: "center"}}>
                            <a href="/"><img src="/images/logo-white.png" alt="LOGO" height={90}/></a>
                        </div>
                        <div className="col-6" style={{textAlign: "center"}}>
                            <h1 className={styles.yellowHead}>Draw&#39;n MINT</h1>
                            <strong className={styles.greenStrong}>Artworks</strong>
                        </div>
                        <div className={styles.topLinks + " col-3"}>
                            <NavLinksSmall activeNo={3}/>
                        </div>
                    </div>
                </div>
                <Nfts/>
            </main>
            <Footer/>
        </div>
    )
}
