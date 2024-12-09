// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RootHashStorage {

    // Mapping to store the list of root hashes for each user
    mapping(address => string[]) private userRootHashes;

    // Event to log when a new root hash is added

    // Function to add a root hash for the caller (user)
    function addRootHash(string memory rootHash) public {
        require(bytes(rootHash).length > 0, "Root hash cannot be empty");

        // Adding the root hash to the user's list
        userRootHashes[msg.sender].push(rootHash);

        // Emit an event that a root hash was added
    }

    // Function to get all root hashes for the caller (user)
    function getRootHashes() public view returns (string[] memory) {
        return userRootHashes[msg.sender];
    }

    // Function to get all root hashes for a specific user
    function getRootHashesForUser(address user) public view returns (string[] memory) {
        return userRootHashes[user];
    }
}
