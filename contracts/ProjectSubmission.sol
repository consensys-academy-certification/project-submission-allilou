pragma solidity ^0.5.0; // Step 1

contract ProjectSubmission { // Step 1

    address payable public owner; // Step 1 (state variable)
    uint256 public ownerBalance; // Step 4 (state variable)
    modifier onlyOwner() { // Step 1
      require(msg.sender == owner, "Only owner is able to call this function");
      _;
    }
    
    struct University { // Step 1
        bool available;
        uint256 balance;
    }
    mapping (address => University) public universities; // Step 1 (state variable)
    
    enum ProjectStatus { Waiting, Rejected, Approved, Disabled } // Step 2

    struct Project { // Step 2
        address author;
        address university;
        ProjectStatus status;
        uint256 balance;
    }
    mapping (bytes32 => Project) public projects; // Step 2 (state variable)

    constructor () public {
      owner = msg.sender;
    }

    function registerUniversity(address university) public onlyOwner { // Step 1
      universities[university].available = true;
    }
    
    function disableUniversity(address university) public onlyOwner  { // Step 1
      universities[university].available = false;
    }
    
    function submitProject (bytes32 hashDoc, address university) public payable { // Step 2 and 4
      require(msg.value >= 1 ether, "Fee must be >= 1 ether");
      require(universities[university].available == true, "Requsted university is unavailaible");

      projects[hashDoc].author = msg.sender;
      projects[hashDoc].university = university;
      projects[hashDoc].status = ProjectStatus.Waiting;

      uint256 oldBalance = ownerBalance;
      ownerBalance = oldBalance + msg.value;
      require(ownerBalance >= oldBalance, "Adition overflow");
    }
    
    function disableProject(bytes32 hashDoc) public onlyOwner { // Step 3
    projects[hashDoc].status = ProjectStatus.Disabled;
    }
    
    function reviewProject(bytes32 hashDoc, ProjectStatus status) public  onlyOwner { // Step 3
      require(projects[hashDoc].status == ProjectStatus.Waiting, "Project is not waiting for decision");
      require(status == ProjectStatus.Rejected || status == ProjectStatus.Approved, "Incorrect status");
      projects[hashDoc].status = status;
    }
    
    function donate(bytes32 hashDoc) public payable { // Step 4
      require(msg.value >= 0, "No money donated");
      Project storage project = projects[hashDoc];
      require(project.status == ProjectStatus.Approved,"Donation for non appoved project");
      
      uint256 value = uint256(msg.value) / 10;
      ownerBalance = ownerBalance + value;
      
      uint256 oldBalance = project.balance;
      project.balance = oldBalance + value * 7;
      require(project.balance >= oldBalance, "Adition/multiplication overflow");
      
      uint256 universityBalance = universities[project.university].balance;
      universities[project.university].balance = universityBalance + value * 2;
      require(universities[project.university].balance >= universityBalance, "Adition/multiplication overflow");
    }
    
    
    function withdraw(bytes32 docHash) public payable { // Step 5
      require(projects[docHash].author == msg.sender, "You are not the author of the project");
      uint256 balance = projects[docHash].balance;
      projects[docHash].balance = 0;
      msg.sender.transfer(balance);
    }
    
    function withdraw() public payable {  // Step 5 (Overloading Function)
    uint256 balance;

    if (msg.sender == owner) {
      balance = ownerBalance;
      ownerBalance = 0;
      owner.transfer(balance);
    }
    else {
      balance = universities[msg.sender].balance;
      universities[msg.sender].balance = 0;
      msg.sender.transfer(balance);
      }
    }
}