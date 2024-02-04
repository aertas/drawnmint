import Head from 'next/head'
import AboutDev from "./components/about-dev";
import styles from '../styles/nftlist.module.scss'
import NavLinksSmall from "./components/nav-links-small";
import Footer from "./components/footer";

export default function Home() {
    return (
        <div>
            <Head>
                <title>Ahmet Ertas</title>
                <meta name="description" content="About Ahmet Ertas"/>
            </Head>
            <main className={styles.container}>
                <div className="container"
                     style={{marginBottom: "1rem", paddingBottom: "0", borderBottom: "1px solid #555"}}>
                    <div className="row">
                        <div className="col-3" style={{textAlign: "center"}}>
                            <a href="/"><img src="/images/logo-white.png" alt="LOGO" height={90}/></a>
                        </div>
                        <div className="col-6" style={{textAlign: "center"}}>
                            <h1 className={styles.yellowHead}>The Developer</h1>
                            <strong className={styles.greenStrong}>aertas</strong>
                        </div>
                        <div className={styles.topLinks + " col-3"}>
                            <NavLinksSmall activeNo={5}/>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <AboutDev/>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    )
}
