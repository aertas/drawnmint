import styles from "../../styles/nft-card.module.scss";
import conf from "../../next.config";

export default function NftsCard({hash, tokenId, initiliazed}) {

    if (initiliazed) {
        // + "_" + tokenId
        return (
            <div className="col-3">
                <a className={styles.cardlink} href={"/nfts/" + hash }>
                    <img className={styles.cardimg}
                         src={conf.network.apiUrl + "/image/low/" + hash + ".png"} alt=""/>
                </a>
            </div>
        )
    } else {
        return (
            <div className="col-3">
                <img className={styles.cardimg} src="/images/loading.gif" alt=""/>
            </div>
        )
    }
}

