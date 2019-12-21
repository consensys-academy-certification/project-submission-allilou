# Assignment Description
In this coding assignment you will have to implement the smart contract **Project Submission** and a script using **web3.js** following the instructions provided in this document.

Only the files **ProjectSubmission.sol** and **app.helper.js** should be modified for this assignment, otherwise your answer may be disqualified. 

You can look at the tests in **ProjectSubmission.test.js** and **test.app.js** and run `truffle test` to ensure that your contract is working properly.

__**IMPORTANT**__: Once you finish coding this assignment, commit all the changes to your personal assignment repository (**consensys-academy-certification/project-submission-*YOUR_GITHUB_USERNAME***) and submit your GitHub username at [https://learn.consensys.net](https://learn.consensys.net). This submission has to be done before the expiry date of the certification exam and can only be done once (be sure you commit your solution first).


# Project Submission Specification
Your task is to develop a smart contract that will allow students to submit projects that, if approved, will be able to receive donations. You also have to implement a script to access this smart contract using the web3.js library.

Only students from registered universities will be able to submit projects to the smart contract.

The donation values will be divided between the project, the university, and the smart contract owner.

For easier understanding, this task is split into 5 steps where you will implement the requested functionalities of the smart contract. The **ProjectSubmission.sol** file contains commented pieces of code that have to be used in your solution. Variables and function names in these pieces of code should not be modified. The smart contract should compile with no errors by the end of each step. For instructions on implementing the script using web3, see comments in the file **app.helper.js**.

## Step 1
Create a smart contract that allows only the contract owner to register universities.

Each university should have an account address, a balance and a way to indicate whether the university is available for new project submissions or not.

The owner can make a university unavailable for new project submissions. This action cannot be undone.


## Step 2
Students should be able to submit projects by paying a fee of 1 Ether.

In addition to the hash of the project document, a project submission should choose one of the already registered universities. 

A project should also have a balance and a way to set one of the following statuses:

0. Waiting (default)
1. Rejected
2. Approved
3. Disabled

## Step 3
After reviewing, the contract owner should be able to set the status of a Waiting project to Rejected or Approved.

In a different moment, the contract owner should be able to disable Approved projects.


## Step 4
Until now, we only have a way to store the universities and project balances. We should also have a way to know the contract owner's balance.

All submissions fees should go to the contract owner balance.

The contract should accept any donations to Approved projects. The donation values should be divided as following:

* 70% to the project
* 20% to the indicated university
* 10% to the contract owner

## Step 5
Universities, students and the contract owner should be able to withdraw all their available funds anytime.

The withdraw for Universities and the contract owner should be pretty simple, not requiring them to send any extra information.

Students should specify the project they want to withdraw the available funds.

__TIP: use the concept of Overloading (two functions with the same name but different parameters).__

