const fs = require('fs');
const str = "http://localhost:3000/api/hls/temp/master.m3u8";
const finalString = str.replace("http://localhost:3000/api", "public").replace("master.m3u8", "");


fs.rm(finalString, { recursive: true, force: true }, err => {
    if (err) {
        throw err;
    }
    console.log(`${finalString} is deleted!`);
});

console.log(finalString);
