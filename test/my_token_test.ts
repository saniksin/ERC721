import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";

describe('MyToken', function() {
    let token: MyToken;
    let deployer: string;
    let user: string;
    let tokenId: string = "bafybeiet7gy5wg6lff4afkpftyzcnwmylr5y53xcw5ou2di55zzpqenbjm";
    let tokenAsUser: MyToken;

    before(async function() {
        ({deployer, user} = await getNamedAccounts());

        await deployments.fixture(['MyToken']);
        const deployment = await deployments.get('MyToken');
        
        const deployerSigner = await ethers.getSigner(deployer);
        const userSigner = await ethers.getSigner(user);
        token = MyToken__factory.connect(deployment.address, deployerSigner);
        tokenAsUser = MyToken__factory.connect(deployment.address, userSigner);
    });
    
    describe('main func', function() {
        it("tokenURI is correct", async function() {
            const mintTx = await token.safeMint(user, tokenId);
            await mintTx.wait();
    
            expect(await token.tokenURI(0)).to.eq(`ipfs://${tokenId}`);
        })
    
        it("totalSupply = 2", async function() {
            const tokenId2 = "bafybeiet7gy5wg6lff4afkpftyzcnwmylr5y53xcw5ou2di55zzpqen54t";
    
            const mintTx2 = await token.safeMint(user, tokenId2);
            await mintTx2.wait();
    
            expect(await token.totalSupply()).to.eq(2); 
        });
    
        it("totalSupply = 3 and tokenID is correct", async function() {
            const tokenId3 = "mafybeiet7gy5wg6lff4afkpftyzcnwmylr5y53xcw5ou2di55zzpqen54t";
    
            const mintTx3 = await token.safeMint(deployer, tokenId3);
            await mintTx3.wait();
    
            expect(await token.totalSupply()).to.eq(3);
            const deployerTokenId = await token.tokenOfOwnerByIndex(deployer, 0);
            expect(deployerTokenId).to.eq(2);
            expect(await token.tokenURI(deployerTokenId)).to.eq(`ipfs://${tokenId3}`)
        });

        it("correct index", async function() {
            expect(await token.tokenOfOwnerByIndex(deployer, 0)).to.eq(2);
        })

        it("first NFT tokenURI correct", async function() {
            expect(await token.tokenURI(0)).to.eq(`ipfs://${tokenId}`);
        })

        it("approve and transfer", async function() {
            const deployerTokenId = 2;
            expect(await token.ownerOf(deployerTokenId)).to.eq(deployer);

            const approveTx = await token.approve(user, deployerTokenId);
            await approveTx.wait();

            const TransferTx = await tokenAsUser.transferFrom(deployer, user, deployerTokenId);
            await TransferTx.wait();

            expect(await token.ownerOf(deployerTokenId)).to.eq(user);
        })

        it("burn", async function() {
            const userTokenId = 2;
            const totalSupplyBefore = 3;
            const totalSupplyAfter = 2;

            expect(await token.totalSupply()).to.eq(totalSupplyBefore);
            
            const BurnTx = await tokenAsUser.burn(userTokenId);
            await BurnTx.wait();

            expect(await token.totalSupply()).to.eq(totalSupplyAfter);
        })

        it("check incorrect index", async function() {

            await expect(token.tokenByIndex(50)).to.be.revertedWith("out of bonds");
        })
    })
})