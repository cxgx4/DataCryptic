// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FailVault is ERC721URIStorage, Ownable, AccessControl {
    uint256 private _nextTokenId;

    // Define the "Developer" Role
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");

    struct Item {
        uint256 id;
        address seller;
        uint256 price;
        string title;
        string litReview;
        string findings;
        bool isSold;
        bool isActive; // Allows devs to hide items
    }

    Item[] public items;

    event ItemListed(uint256 indexed id, address seller, uint256 price);
    event ItemSold(uint256 indexed id, address buyer, uint256 price);
    event ItemDelisted(uint256 indexed id, address developer);

    constructor() ERC721("FailVault", "FAIL") Ownable(msg.sender) {
        // Grant the deployer (you) the Admin and Developer roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DEVELOPER_ROLE, msg.sender);
    }

    // 1. Standard Publish Function
    function listExperiment(
        string memory tokenURI, 
        string memory title, 
        string memory litReview, 
        string memory findings, 
        uint256 price
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // isActive is true by default
        items.push(Item(tokenId, msg.sender, price, title, litReview, findings, false, true));

        emit ItemListed(tokenId, msg.sender, price);
        return tokenId;
    }

    // 2. Standard Buy Function (UPDATED)
    function buyExperiment(uint256 itemId) public payable {
        Item storage item = items[itemId];
        require(item.isActive, "Item has been delisted");
        require(!item.isSold, "Already sold");
        require(msg.value >= item.price, "Not enough money");

        // Effects: Update state BEFORE external calls to prevent re-entrancy
        item.isSold = true;

        // Refund overpayment (Using .call instead of .transfer for Smart Wallet support)
        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - item.price}("");
            require(refundSuccess, "Refund failed");
        }

        // Interactions: Pay the seller
        (bool success, ) = payable(item.seller).call{value: item.price}("");
        require(success, "Transfer to seller failed");

        // Transfer the NFT ownership
        _transfer(item.seller, msg.sender, item.id);
        
        emit ItemSold(itemId, msg.sender, item.price);
    }

    // --- DEVELOPER ONLY FUNCTIONS ---

    // 3. Devs can "Delist" (Hide) scams or fake data
    function toggleListingStatus(uint256 itemId) public onlyRole(DEVELOPER_ROLE) {
        items[itemId].isActive = !items[itemId].isActive;
        emit ItemDelisted(itemId, msg.sender);
    }

    // 4. Admin can add new Developers
    function addDeveloper(address newDev) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEVELOPER_ROLE, newDev);
    }

    // 5. Override supportsInterface (Required by Solidity)
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getAllItems() public view returns (Item[] memory) {
        return items;
    }
}
