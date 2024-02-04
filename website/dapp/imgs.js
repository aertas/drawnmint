const imgs = {
    1: "NFT 1",
    2: "NFT 2",
    3: "NFT 3",
    4: "NFT 4",
};

const stories = {
    1: "description here",
    2: "description here",
    3: "description here",
    4: "description here",
};

export const getimgids = () => {
    let objKeys = [];
    for (let i in imgs) {
        objKeys.push(Number(i));
    }
    return objKeys;
};

export const getimgs = () => {
    return imgs;
};

export const getName = (imgid) => {
    return imgs[imgid];
};

export const getStory = (imgid) => {
    return stories[imgid];
};

export const getStories = () => {
    return stories;
};

