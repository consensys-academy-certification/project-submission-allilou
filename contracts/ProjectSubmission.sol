pragma... // Step 1

contract ProjectSubmission { // Step 1

    ...owner... // Step 1 (state variable)
    // ...ownerBalance... // Step 4 (state variable)
    modifier onlyOwner() { // Step 1
      ...
    }
    
    struct University { // Step 1
        ...available...
        ...balance...
    }
    ...universities... // Step 1 (state variable)
    
    // enum ProjectStatus { ... } // Step 2
    // struct Project { // Step 2
    //     ...author...
    //     ...university...
    //     ...status...
    //     ...balance...
    // }
    // ...projects... // Step 2 (state variable)
    
    function registerUniversity... { // Step 1
      ...
    }
    
    function disableUniversity... { // Step 1
      ...
    }
    
    // function submitProject... { // Step 2 and 4
    //   ...
    // }
    
    // function disableProject... { // Step 3
    //   ...
    // }
    
    // function reviewProject... { // Step 3
    //   ...
    // }
    
    // function donate... { // Step 4
    //   ...
    // }
    
    // function withdraw... { // Step 5
    //   ...
    // }
    
    // function withdraw... {  // Step 5 (Overloading Function)
    //   ...
    // }
}