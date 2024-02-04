import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Sketch from './components/paint'

import SiteLogo from "./components/sitesvglogo";

export default function Home() {
    return (
        <div>
            <Head>
                <title>Draw'n Mint</title>
            </Head>
            <main>
                <div className={styles.container}>
                    <div className={styles.section} id="sketch-page">
                        <div className="sketch-cont">
                            <SiteLogo/>
                            <Sketch/>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
