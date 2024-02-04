# Draw'n Mint API Documentation

## Overview

This documentation provides comprehensive details on setting up and utilizing the API for the *draw'n mint* project. It serves as the backbone for minting NFTs and managing metadata associated with each digital artwork created through the platform. Please follow the steps meticulously to ensure smooth integration and operation.

### Prerequisites

To get started, ensure you have the latest versions of Node.js and npm installed on your system. These are essential for running the API and its associated commands.

### Environment Setup

Before running the API, you need to configure the environment variables. Create a `.env` file in the root directory of your project and add the following key-value pairs:

```
DO_SPACES_ENDPOINT=your_endpoint_url
DO_SPACES_KEY=your_spaces_key
DO_SPACES_SECRET=your_spaces_secret
DO_SPACES_NAME=your_spaces_name
API_BASE=https://your-api-domain
WEB_BASE=https://your-mint-site-domain
```

These variables are crucial for connecting to your storage solution and setting the base URLs for the API and the front-end application.

### Running the API

The API runs on port 3000 by default. To start the API, navigate to the root directory of the project in your terminal and execute:

```
npm run start
```

This command activates the API server, making it listen for requests on the specified port.

### API Endpoints

The API supports several endpoints, each designed for specific operations within the minting process. Below are the available endpoints and their functionalities:

1) **POST `/mint`**

   Processes NFT parameters submitted from the site. This endpoint is called during the minting operation and records `imgid` and `lines` values in a JSON file.

2) **GET `/html/:hash.html`**

   Generates and caches an HTML file for an NFT based on the provided `hash`. If the file doesn't exist, this endpoint will create it.

3) **GET `/metadata/:hash.json`**

   Creates and returns a metadata JSON file for the given `hash`.

4) **GET `/assets/:season/:imgname.png`**

   Retrieves standard NFT images based on the specified `season` and `imgname` parameters.

5) **GET `/image/:type/:hash.png`**

   Generates and returns a preview image for an NFT. Accepts `type` (thumb, low, high, original) and `hash` as parameters.

6) **GET `/get-token/:hash`**

   Returns a random hash. This endpoint is typically used for generating unique identifiers for new NFTs.

### Conclusion

This API is a crucial component of the *draw'n mint* project, facilitating the minting and management of NFTs created on the platform. By following the setup instructions and understanding the functionalities of each endpoint, you can effectively integrate and leverage the API for your needs.

Should you encounter any issues or require further assistance, please do not hesitate to reach out or consult the documentation for more detailed information.