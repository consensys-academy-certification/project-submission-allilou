// ===== DO NOT MODIFY THIS FILE =====

var assert = require('assert')
const Web3 = require('web3')

const App = require('../scripts/app.helper.js')

let accounts = []

/*
    This test file makes assumptions about
        - properties names of structs
        - university and project data structures in contract storage
    that are defined in the ProjectSubmission.sol file.
*/

describe('App Tests', function() {

    let ownerAccount
    let universityAccount1
    let universityAccount2
    let userAccount1
    let userAccount2
    let hash1 = "0x681afa780d17da29203322b473d3f210a7d621259a4e6ce9e403f5a266ff719a"
    let hash2 = "0xb6a955c14d250a9b036a6cf4dae42e1140fa56d8cb29ca70050d6e8ab81b457f"

    before(async function(){
        web3 = new Web3("ws://localhost:8545")
        web3.givenProvider = web3.currentProvider // to mimic a browser environment
        accounts = await web3.eth.getAccounts()
        ownerAccount = accounts[0]
        web3.eth.defaultAccount = ownerAccount
        universityAccount1 = accounts[1]
        universityAccount2 = accounts[2]
        userAccount1 = accounts[3]
        userAccount2 = accounts[4]
        await App.init()
    })

    describe('Calling the contract', function() {

        it("Gets the current account", async function(){
            await App.getAccount()
            assert.equal(ownerAccount, App.account, "The accounts should be the same")
        })

        it("Has a function to read the contract owner", async function(){
            let result = await App.readOwnerAddress()
            assert.equal(ownerAccount, result, "Owner should be the first account")
        })

        it("Has a function to read the contract owner balance", async function(){
            let result = await App.readOwnerBalance()
            assert.equal(result, 0, "Owner should be the first account")
        })

        it("Has a function for the owner to register a University", async function(){
            let result = await App.registerUniversity(universityAccount1)
            assert.equal(result.receipt.status, true, "Registering a university should result in a successful transaction")
        })

        it("Has a function to read the university state", async function(){
            await App.registerUniversity(universityAccount1)
            let result = await App.readUniversityState(universityAccount1)
            assert.equal(result.balance, 0, "Balance of university 1 should be 0")
            assert.equal(result.available, true, "The university should be accepting submissions")
        })

        it("Has a function to let the owner disable the university", async function(){
            let result = await App.disableUniversity(universityAccount1)
            assert.equal(result.receipt.status, true, "The university should be accepting submissions")
            let universityState1 = await App.readUniversityState(universityAccount1)
            assert.equal(universityState1.available, false, "")
        })

        it("Has a function to let anyone submit projects", async function(){
            await App.registerUniversity(universityAccount1)
            web3.eth.defaultAccount = userAccount1
            let etherAmount = 1
            let result = await App.submitProject(hash1, universityAccount1, etherAmount)
            assert.equal(result.receipt.status, true, "Registering a university should result in a successful transaction")
        })

        it("Has a function to let the owner review projects", async function(){
            web3.eth.defaultAccount = ownerAccount
            let result = await App.reviewProject(hash1, 2)
            assert.equal(result.receipt.status, true, "Calling the reviewProject function should result in a successful transaction")
        })

        it("Has a function to let anyone read a projects' state", async function(){
            let result = await App.readProjectState(hash1)
            assert.equal(result.author, userAccount1, "The author of project associated with hash1 should be userAccount1")
        })

        it("Has a function to let anyone donate to a univesrity and a project", async function(){
            web3.eth.defaultAccount = userAccount2
            let amount = 100
            let result = await App.donate(hash1, amount)
            assert.equal(result.receipt.status, true, "Calling the donate function should result in a successful transaction")
        })

        it("Has a function to let the owner withdraw their funds", async function(){
            web3.eth.defaultAccount = ownerAccount
            let result = await App.withdraw(hash2)
            assert.equal(result.receipt.status, true, "Calling the withdraw function should result in a successful transaction")
        })

        it("Has a function to let the project authors withdraw their funds", async function(){
            web3.eth.defaultAccount = userAccount1
            let result = await App.authorWithdraw(hash1)
            assert.equal(result.receipt.status, true, "Calling the authorWithdraw function should result in a successful transaction")
        })
    })
})
