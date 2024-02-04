import styles from "../../styles/footer.module.scss";
import SocialLinks from "./social-links";
import NavLinksSmall from "./nav-links-small";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerRow + " row"}>
                    <div className="col-6">
                        <SocialLinks/>
                    </div>
                    <div className="col-6" style={{textAlign: "right"}}>
                        <NavLinksSmall/>
                    </div>
                </div>
            </div>

        </footer>
    )
}
