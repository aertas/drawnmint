import Head from 'next/head'

export default function Layout({children}) {
    const domain = process.env.NEXT_PUBLIC_DOMAIN;

    return (
        <>
            <Head>
                <title>Draw'n Mint by Ahmet Ertaş</title>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="description"
                      content="Draw`N Mint is a WEB3 project that allows us to create NFTs from sketches drawn by Ahmet Ertaş."/>
                <link rel="icon" href={`https://${domain}/favicon.ico`}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta property="twitter:domain" content={`${domain}`}/>
                <meta property="twitter:url" content={`https://${domain}`}/>
                <meta name="twitter:title" content="Draw`n Mint"/>
                <meta name="twitter:description"
                      content="Draw`N Mint is a WEB3 project that allows us to create NFTs from sketches drawn by Ahmet Ertaş."/>
                <meta name="twitter:image" content={`https://${domain}/images/share.png`}/>
                <meta name="twitter:site" content="@DevConcof"/>
                <meta name="twitter:creator" content="@DevConcof"/>
                <meta name="theme-color" content="#242424" media="(prefers-color-scheme: dark)"/>
            </Head>
            <main>{children}</main>
        </>
    )
}
