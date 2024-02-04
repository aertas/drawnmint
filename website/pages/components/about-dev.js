import React, {Component} from 'react';
import styles from "../../styles/about.module.scss";

export default class AboutDev extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <section className={styles.aboutMain}>
                <aside className={styles.side}>
                    <a href="https://twitter.com/devconcof" target="_blank" rel="noreferrer">twitter</a>
                    <a href="https://www.instagram.com/devconcof/" target="_blank" rel="noreferrer">instagram</a>
                    <a href="https://www.aertas.com" target="_blank" rel="noreferrer">aertas.com</a>
                </aside>
                <article className={styles.article}>
                    <p>
                        <img src="/images/ahmet.jpg" alt="ahmet ertaş" width={200}/>
                        I have been working as both a back-end and front-end web developer since the early 2000s.
                        As of 2020, I only produce front-end works. I write smart contracts for Ethereum and Avalanche.
                        I also create animated and interactive drawings using vanilla JS, three.js and p5.js on the
                        Tezos, Solana, Ethereum and Avalanche blockchain platforms.
                    </p>
                    <p>
                        Over the past 20 years working in the industry, I helped the development of
                        Websites/News Portals, CRM, ERP, casual games, Mobile Apps,
                        Enterprise Applications and APIs for many companies like: Nestle, QNB, BEKO, LG, McCann.
                    </p>
                </article>
            </section>
        )
    }
}