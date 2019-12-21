// ===== DO NOT MODIFY THIS FILE =====

async function getGasCost(promise, txParams) {
  // For withdraw functions, subtract the value withdrawn from this function return 
  const valueTransferred = web3.utils.toBN((!txParams.value)? 0 : txParams.value)
  const senderBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(txParams.from))
  await promise
  const senderBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(txParams.from))
  const gasCost = senderBalanceBefore.sub(senderBalanceAfter).abs().sub(valueTransferred)
  return gasCost
}

async function tryCatch(promise) {
  const errorString = "VM Exception while processing transaction: "
  const reason = "revert"
  try {
    await promise
    throw null
  }
  catch (error) {
    assert(error, "Expected a VM exception but did not get one")
    assert(error.message.search(errorString + reason) >= 0, "Expected an error containing '" + errorString + reason + "' but got '" + error.message + "' instead")
  }
}

const BN = web3.utils.BN
const ProjectSubmission = artifacts.require('ProjectSubmission')

contract('ProjectSubmission', accounts => {
  const owner = accounts[0]
  const universityA = accounts[1] // Will be disabled
  const universityB = accounts[2] // Always available
  const student1 = accounts[3]
  const student2 = accounts[4]
  const student3 = accounts[5]
  const student4 = accounts[6]
  const student5 = accounts[7]
  const hashDoc1 = '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c' // Registered but will be Rejected
  const hashDoc2 = '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C' // Never registered
  const hashDoc3 = '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' // Registered, will be Approved and receive donations
  const hashDoc4 = '0x583031D1113aD414F02576BD6afaBfb302140225' // Registered and will be Disabled
  const hashDoc5 = '0xdD870fA1b7C4700F2BD7f44238821C26f7392148' // Registered but never reviewed
  const donator = accounts[8]
  const attacker = accounts[9] 
  const donationValue = web3.utils.toWei('20', 'ether')
  const ProjectStatus = Object.freeze({'Waiting':0, 'Rejected':1, 'Approved':2, 'Disabled':3})

  let projectSubmission
  let ownerGasCost = web3.utils.toBN(0)
  let student3GasCost = web3.utils.toBN(0)
  let totalFees = web3.utils.toBN(0)
  let ownerBalance = web3.utils.toBN(0)
  let universityBalance = web3.utils.toBN(0)
  let studentBalance = web3.utils.toBN(0) // Student 3 balance (project3)

  before("Setup contract", async () => {
    projectSubmission = await ProjectSubmission.new()
  })
  
  describe("Step 1", async() => {
    it("Should store the deployer address as owner", async() => {
      assert.equal(
        owner,
        await projectSubmission.owner(),
        "The owner variable does not contain the deployer's address"
      )
    })

    it("Should allow the owner to register universities", async() => {
      const txParams = {from: owner}

      ownerGasCost.iadd(await getGasCost(
        projectSubmission.registerUniversity(
          universityA,
          txParams
        ),
        txParams
      ))

      const registeredUniversityA = await projectSubmission.universities(universityA)

      ownerGasCost.iadd(await getGasCost(
        projectSubmission.registerUniversity(
          universityB,
          txParams
        ),
        txParams
      ))

      assert.isTrue(
        registeredUniversityA['available'],
        "It was not possible to register a university using the owner's account"
      )      
    })
    
    it("Should not allow accounts other than the owner to register a university", async()=>{
      await tryCatch(projectSubmission.registerUniversity(universityB, {from: attacker}))
    })

    it("Should allow the owner to make a university unavailable for new project submissions", async() => {
      const txParams = {from: owner}
      ownerGasCost.iadd(await getGasCost(
        projectSubmission.disableUniversity(
          universityA,
          txParams
        ),
        txParams
      ))

      assert.isFalse(
        (await projectSubmission.universities(universityA))['available'],
        "It was not possible to disable a university using the owner's account"
      )
    })

    it("Should not allow accounts other than the owner to make a university unavailable for new project submissions", async() => { 
      await tryCatch(projectSubmission.disableUniversity(universityA, {from: attacker}))
    })
  })
  
  describe("Step 2", async() => {
    it("Should allow students submit projects by paying a fee of 1 ether", async()=>{ 
      const contractBalanceBefore = await web3.eth.getBalance(projectSubmission.address)
      await projectSubmission.submitProject(
        hashDoc1,
        universityB,
        {from: student1, value: web3.utils.toWei('1', 'ether')}
      )
      const projectDoc1 = await projectSubmission.projects(hashDoc1)
      const contractBalanceAfter = await web3.eth.getBalance(projectSubmission.address)

      const txParams = {from: student3, value: web3.utils.toWei('1', 'ether')}
      student3GasCost.iadd(await getGasCost(
        projectSubmission.submitProject(
          hashDoc3,
          universityB,
          txParams
        ),
        txParams
      ))
      
      await projectSubmission.submitProject(
        hashDoc4,
        universityB,
        {from: student4, value: web3.utils.toWei('1', 'ether')}
      )
      await projectSubmission.submitProject(
        hashDoc5,
        universityB,
        {from: student5, value: web3.utils.toWei('1', 'ether')}
      )
      totalFees.iadd(web3.utils.toBN(web3.utils.toWei('4', 'ether'))) // 4 universities registered
      ownerBalance.iadd(totalFees)

      assert.equal(
        web3.utils.fromWei(contractBalanceAfter, 'ether'),
        web3.utils.fromWei(contractBalanceBefore + web3.utils.toWei('1', 'ether'), 'ether'),
        "It was not possible to register a project submission"
      ) && assert.equal(
        student1,
        projectDoc1['author'],
        "Missing or wrong author address stored in the registered project"
      ) && assert.equal(
        universityB,
        projectDoc1['university'],
        "Missing or wrong university address stored in the registered project"
      )      
    })

    it("Should not allow students submit projects for disabled universities", async()=>{ 
      await tryCatch(
        projectSubmission.submitProject(
          hashDoc2,
          universityA,
          {from: student2, value: web3.utils.toWei('1', 'ether')}
        ))
    })

    it("Should not allow students submit projects without paying the 1 ether fee", async()=>{ 
      await tryCatch(projectSubmission.submitProject(
        hashDoc2,
        universityB,
        {from: student2, value: web3.utils.toWei('1', 'finney')}
      ))
    })
  })
  
  describe("Step 3", async() => {
    it("Should allow the owner to review projects (Reject or Approve)", async() => {
      const txParams = {from: owner}
      ownerGasCost.iadd(await getGasCost(
        projectSubmission.reviewProject(
          hashDoc1,
          ProjectStatus.Rejected,
          txParams
        ),
        txParams
      ))

      projectDoc1 = await projectSubmission.projects(hashDoc1)

      ownerGasCost.iadd(await getGasCost(
        projectSubmission.reviewProject(
          hashDoc3,
          ProjectStatus.Approved,
          txParams
        ),
        txParams
      ))

      projectDoc3 = await projectSubmission.projects(hashDoc3)

      assert.equal(
        projectDoc1['status'],
        ProjectStatus.Rejected,
        "It was not possible to set a project status to Rejected using the owner's account"
      ) && assert.equal(
        projectDoc3['status'],
        ProjectStatus.Approved,
        "It was not possible to set a project status to Approved using the owner's account"
      )
    })

    it("Should only allow the owner to review projects", async()=>{
      await tryCatch(projectSubmission.reviewProject(hashDoc4, ProjectStatus.Approved, {from: attacker}))
    })

    it("Should allow the owner to disable projects", async() => {
      const txParams = {from: owner}
      ownerGasCost.iadd(await getGasCost(
        projectSubmission.disableProject(
          hashDoc4,
          txParams
        ),
        txParams
      ))

      projectDoc4 = await projectSubmission.projects(hashDoc4)
      assert.equal(
        projectDoc4['status'],
        ProjectStatus.Disabled,
        "It was not possible to disable a project using the owner's account"
      )
    })

    it("Should not allow accounts other than the owner to disable projects", async() => {
      await tryCatch(projectSubmission.disableProject(hashDoc3, {from: attacker}))
    })

    it("Should only allow the owner to review projects that are with status Waiting", async() => {
      const txParams = {from: owner}
      ownerGasCost.iadd(await getGasCost(
        tryCatch(
          projectSubmission.reviewProject(
            hashDoc1,
            ProjectStatus.Approved,
            txParams
          )
        ),
        txParams
      ))

      ownerGasCost.iadd(await getGasCost(
        tryCatch(
          projectSubmission.reviewProject(
            hashDoc4,
            ProjectStatus.Approved,
            txParams
          )
        ),
        txParams
      ))
    })
  })
  
  describe("Step 4", async() => {
    it("Should give all the submission fees to the contract owner", async()=>{
      assert.equal(
        Number(await projectSubmission.ownerBalance()),
        ownerBalance,
        "ownerBalance variable is not storing the total amount of project submission fees"
      )
    })

    it("Should accept donations to Approved projects", async() => {
      const contractBalanceBefore = await web3.eth.getBalance(projectSubmission.address)
      await projectSubmission.donate(hashDoc3, {from: donator, value: donationValue})
      const contractBalanceAfter = await web3.eth.getBalance(projectSubmission.address)
      assert.equal(
        contractBalanceAfter,
        Number(contractBalanceBefore) + Number(donationValue),
        "It was not possible to accept a donation for a Approved project"
      )
    })

    it("Should not accept donations for non-Approved projects", async() => {
      await tryCatch(projectSubmission.donate(hashDoc1, {from: donator, value: donationValue}))
      await tryCatch(projectSubmission.donate(hashDoc4, {from: donator, value: donationValue}))
      await tryCatch(projectSubmission.donate(hashDoc5, {from: donator, value: donationValue}))
    })

    it("Should divide donations as following: project 70%, university 20%, owner 10%", async() => {
      const project = await projectSubmission.projects(hashDoc3)
      const university = await projectSubmission.universities(project['university'])
      universityBalance = web3.utils.toBN(university['balance'])
      ownerBalance = await projectSubmission.ownerBalance()
      studentBalance = project['balance']


      assert.equal(
        studentBalance,
        donationValue * 7 / 10,
        "Project balance is not getting 70% of the donations"
      ) && assert.equal(
        universityBalance,
        donationValue * 2 / 10,
        "University balance is not getting 20% of the donations"
      ) && assert.equal(
        Number(ownerBalance) - totalFees,
        donationValue * 1 / 10,
        "Owner balance is not getting 10% of the donations"
      )
    })
  }) 
  
  describe("Step 5", async() => {
    it("Should allow the owner withdraw all their available funds", async() => {
      const ownerAccountBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(owner))
      const ownerBalanceBefore = ownerBalance
      ownerBalance = web3.utils.toBN(0)

      const txParams = {from: owner}
      const withdrawGasCost = await getGasCost(
        projectSubmission.withdraw(txParams),
        txParams
      )
      withdrawGasCost.isub(ownerBalanceBefore).iabs()

      await ownerGasCost.iadd(withdrawGasCost)
      const ownerAccountBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(owner))

      assert.equal(
        ownerAccountBalanceBefore.add(ownerBalanceBefore).toString(),
        ownerAccountBalanceAfter.add(withdrawGasCost).toString(),
        "Wrong owner account balance after withdraw funds"
      ) && assert.isTrue(await projectSubmission.ownerBalance() == 0,
        "The variable ownerBalance should be 0 after the owner withdraw all their available funds")
    })

    it("Should allow a university withdraw all their available funds", async() => {
      const universityAccountBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(universityB))
      const universityBalanceBefore = universityBalance
      universityBalance = web3.utils.toBN(0)

      const txParams = {from: universityB}
      const withdrawGasCost = await getGasCost(
        projectSubmission.withdraw(txParams),
        txParams
      )
      withdrawGasCost.isub(universityBalanceBefore).iabs()
      const universityAccountBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(universityB))

      assert.equal(
        universityAccountBalanceBefore.add(universityBalanceBefore).toString(),
        universityAccountBalanceAfter.add(withdrawGasCost).toString(),
        "Wrong university account balance after withdraw funds"
      ) && assert.isTrue(await projectSubmission.universities(universityB)['balance'] == 0,
        "The university balance in the contract should be 0 after they withdraw all their available funds")
    })

    it("Should allow student authors withdraw all available funds of a project", async() => {
      const studentAccountBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(student3))
      const studentBalanceBefore = studentBalance
      studentBalance = web3.utils.toBN(0)
      const txParams = {from: student3}
      const withdrawGasCost = await getGasCost(
        projectSubmission.methods['withdraw(bytes32)'](hashDoc3, {from: student3}),
        txParams
      )
      withdrawGasCost.isub(studentBalanceBefore).iabs()
      const studentAccountBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(student3))

      assert.equal(
        studentAccountBalanceBefore.add(studentBalanceBefore).toString(),
        studentAccountBalanceAfter.add(withdrawGasCost).toString(),
        "Wrong student author account balance after withdraw funds of a project"
      ) && assert.isTrue(await projectSubmission.projects(hashDoc3)['balance'] == 0,
        "The project balance in the contract should be 0 after the author withdraw all it available funds")
    })
  })
})
