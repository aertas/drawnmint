import conf from "/next.config.js";
import styles from "../../styles/mint.module.scss";

export default function SocialLinks() {
    return (<div className={styles.socialIcons}>

            <a href={conf.network.collectionOpenseaUrl} target="_blank" rel="noreferrer">
                <img src="/images/social/opensea.png" alt="opensea icon"/>
            </a>
            <a href={conf.network.collectionEtherscanUrl} target="_blank" rel="noreferrer">
                <img src="/images/social/etherscan.png" alt="etherscan icon"/>
            </a>

            <a href="https://discord.gg/" target="_blank" rel="noreferrer">
                <img src="/images/social/discord.png" alt="discord icon"/>
            </a>
            <a href="https://twitter.com/devconcof" target="_blank" rel="noreferrer">
                <img src="/images/social/aertas.png" alt="aertas icon"/>
            </a>
        </div>
    )
}
