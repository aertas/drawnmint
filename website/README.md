# Draw'n Mint Website

Welcome to the Draw'n Mint project website repository. This innovative platform bridges the gap between digital art creation and blockchain technology, allowing users to not only unleash their creativity by painting over pre-designed images but also to mint their artworks as unique NFTs on the Ethereum blockchain.

The website is a key component of the project, facilitating the interaction between users and the underlying smart contracts while providing a seamless, intuitive user experience for creating, minting, and exploring NFTs.

## Features

The Draw'n Mint website offers a range of features designed to enhance the user experience and streamline the NFT creation process:

- **Ethereum Wallet Integration:** Users can easily connect their Ethereum wallets to interact with the platform, enabling secure transactions and minting operations.
- **Interactive Painting Tool:** A sophisticated online painting tool, powered by the p5.js library, allows users to add colors and designs to pre-existing images, setting the stage for their unique NFT creations.
- **NFT Minting:** After finalizing their artworks, users can mint their creations as NFTs directly through the website, thanks to the integration with the project's smart contract.
- **NFT Gallery:** Minted NFTs are showcased in a user-friendly gallery, where creators and visitors can explore the diverse range of artistic works and view details about each piece.
- **Metadata and NFT Management:** Backend services handle metadata generation and NFT management, ensuring that each art piece is represented accurately and stored securely.

## Technical Overview

The website is developed using Next.js, a powerful React framework that enables server-side rendering and static site generation, significantly improving performance and user experience. Next.js's features like dynamic routing and API routes are extensively utilized to create a responsive, dynamic web application that interacts seamlessly with Ethereum blockchain and smart contracts.

### Configuration

All configuration settings are centralized within the `next.config.js` file, streamlining the project setup and deployment process. These configurations include:

- **Environment Variables:** API endpoints, smart contract addresses, and other sensitive data are managed as environment variables, ensuring flexibility and security across different deployment environments.
- **Custom Webpack Configurations:** Tailored webpack configurations enhance the build process, optimizing the overall performance and efficiency of the website.
- **Redirects and Rewrites:** Custom redirects and rewrites are defined to manage routing and URL structures, improving SEO and user navigation.
- **Image Optimization:** Next.js's built-in Image Optimization settings are configured for optimal loading times and performance, ensuring that the website remains fast and responsive even with high-quality artwork displays.

## Getting Started

To run the website locally:

1. Clone the repository to your local machine.
2. Navigate to the website directory in your terminal.
3. Install dependencies by running `npm install`.
4. Set up your environment variables in `.env.local` based on the `next.config.js` file.
5. Run the development server with `npm run dev`.

Your local development server will start, and you can access the website by navigating to `http://localhost:8082` in your browser.

## Contribution

Contributions are welcome! If you're interested in enhancing the Draw'n Mint website or have suggestions for improvements, please feel free to fork the repository, make changes, and submit a pull request. For major changes or new features, it's best to open an issue first to discuss your ideas with the community.

## Licensing

The Draw'n Mint project, including the website component, is released under the MIT License, offering great flexibility for academic and commercial use while absolving the contributors of liability. For more details, see the [LICENSE](https://opensource.org/licenses/MIT) file.

For additional inquiries or support, please open an issue in the GitHub repository.