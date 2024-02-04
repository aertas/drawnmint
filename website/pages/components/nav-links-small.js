export default function NavLinksSmall({activeNo}) {
    return (<>
            <a className={"decorated inline" + (activeNo === 1 ? " active" : "")} href="/">Draw</a>
            <a className={"decorated inline" + (activeNo === 2 ? " active" : "")} href="/how-it-works">How?</a>
            <a className={"decorated inline" + (activeNo === 3 ? " active" : "")} href="/nfts">NFTs</a>
            <a className={"decorated inline" + (activeNo === 5 ? " active" : "")} href="/about-dev">Dev</a>
        </>
    )
}
