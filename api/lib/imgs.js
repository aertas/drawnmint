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

exports.getimgids = () => {
    let objKeys=[];
    for (let i in imgs){
        objKeys.push(Number(i));
    }
    return objKeys;
};

exports.getimgs = () => {
    return imgs;
};
exports.getStory = (imgid) => {
    return stories[imgid];
};
exports.getStories = () => {
    return stories;
};
