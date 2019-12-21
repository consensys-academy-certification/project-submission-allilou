// ===== DO NOT MODIFY THIS FILE =====

const BN = web3.utils.BN
const ProjectSubmission = artifacts.require('ProjectSubmission')

contract('ProjectSubmission', accounts => {
    const owner = accounts[0]
    const universityA = accounts[1]
    const universityB = accounts[2]
    const student1 = accounts[3]
    const student2 = accounts[4]
    const donatorX = accounts[5]
    const donatorY = accounts[6]
    let projectSubmission
    
    before("Setup contract", async () => {
      projectSubmission = await ProjectSubmission.deployed()
    })

    it("Should ...", async() => {
        
    })

    it("Should ...", async() => {
        
    })

    it("Should ...", async() => {
        
    })

    it("Should ...", async() => {
        
    })

})