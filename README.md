# Coding Assignment
In this coding assignment you will have to implement the smart contract Project Submission following the instructions provided in this document.

The ProjectSubmission.sol file contains commented pieces of code that have to be used in your solution. Variables and function names in these pieces of code should not be modified. Only the file ProjectSubmission.sol should be modified for this assignment, otherwise your submission may be disqualified.

You can look at the tests in ProjectSubmission.test.js and run truffle test to be sure that your contract is working properly.

**IMPORTANT:**

Once you coded the smart contract and committed all the changes to your personal assignment repository (consensys-academy-certification/project-submission-your_github_username), submit your GitHub username at the bottom of the Coding Assignment page in the exam you are taking in our platform [https://learn.consensys.net](https://learn.consensys.net) so it can be graded. This submission has to be done before the expiry date of the certification exam and can only be done once (be sure you commit your solution first).

## Project Submission specification
Your task is to develop a smart contract that will allow students to submit projects that, if approved, will be able to receive donations.

Only students from registered universities will be able to submit projects to the smart contract.

The donation values will be divided between the project, the university, and the smart contract owner.

For easier understanding, this task is split into 5 steps where you will implement the requested functionalities. The smart contract should compile with no errors by the end of each step. You will find additional instructions as comments into the ProjectSubmission.sol file.

### Step 1
Create a smart contract that allows only the contract owner to register universities.

Each university should have an account address, a balance and a way to indicate whether the university is available for new project submissions or not.

The owner can make a university unavailable for new project submissions. This action cannot be undone.

### Step 2
Students should be able to submit projects by paying a fee of 1 Ether.

In addition to the hash of the project document, a project submission should choose one of the already registered universities. 

A project should also have a balance and a way to set one of the following statuses:
- Waiting (default)
- Rejected
- Approved
- Disabled

### Step 3
After reviewing, the contract owner should be able to set the status of a Waiting project to Rejected or Approved.

In a different moment, the contract owner should be able to disable Approved projects.

### Step 4
Until now, we only have a way to store the universities and project balances. We should also have a way to know the contract owner's balance.

All submissions fees should go to the contract owner balance.

The contract should accept any donations to Approved projects. The donation values should be divided as following:
- 70% to the project
- 20% to the indicated university
- 10% to the contract owner

### Step 5
Universities, students and the contract owner should be able to withdraw all their available funds anytime.

The withdraw for Universities and the contract owner should be pretty simple, not requiring them to send any extra information. Students should specify the project they want to withdraw the available funds.

*TIP: use the concept of Overloading (two functions with the same name but different parameters).*



