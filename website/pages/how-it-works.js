import Head from 'next/head'
import styles from '../styles/nftlist.module.scss'
import NavLinksSmall from "./components/nav-links-small";
import Footer from "./components/footer";

export default function Home() {
    return (
        <div>
            <Head>
                <title>How It Works?</title>
                <meta name="description" content="About Draw'n Mint Project"/>
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
                            <strong className={styles.greenStrong}>How It Works?</strong>
                        </div>
                        <div className={styles.topLinks + " col-3"}>
                            <NavLinksSmall activeNo={2}/>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className={styles.article + " col-12"}>
                            <h2>How It Works?</h2>
                            <p><strong>In short;</strong> draw and mint :)</p>
                            <p>
                                You can edit the drawing with the Toolbar tools, you can download it to your computer.
                                You can switch between different drawings and your painting will be stored in
                                your browser&#39;s memory. If it is drop time, you can mint your painting.
                            </p>
                            <h3>What Is The Season?</h3>
                            <p>
                                Draw&#39;N mint consists of four separate seasons.
                                There will be approximately 500 supply units per season,
                                with an overall collection supply of approximately 2K.
                            </p>
                            <h4>Season One</h4>
                            <h4>How WIll NFTs Be?</h4>
                            <p>
                                Your paints will be animated according to the order in which they were made.
                                You will not only have the final picture of your work,
                                but also your methods according to the order of painting.
                            </p>

                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    )
}
