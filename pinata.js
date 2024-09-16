require('dotenv').config();

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(process.env.KEY1, process.env.KEY2)

const fs = require('fs');

const readableStreamForFile = fs.createReadStream('./test.png')

const options = {
    pinataMetadata: {
        name: "test"
    },
    pinataOptions: {
        cidVersion: 1
    } 
}

pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
	// handle result here
	console.log(result);
}).catch((err) => {
	// handle error here
	console.log(err);
});