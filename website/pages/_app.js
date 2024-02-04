import Head from 'next/head'
import '../styles/globals.scss'
import Layout from './components/layout'
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
      <>
        <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-55X7HE69XY"
            strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){window.dataLayer.push(arguments);}
                      gtag('js', new Date());
            
                      gtag('config', 'G-55X7HE69XY');
                    `}
        </Script>
          <Layout>
              <Head>
                  <title>Draw'n Mint App</title>
                  <meta name="viewport" content="initial-scale=1.0, width=device-width" />
              </Head>
              <Component {...pageProps} />
          </Layout>
      </>
  )
}

export default MyApp
