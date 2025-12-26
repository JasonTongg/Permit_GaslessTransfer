// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Minimal ERC20 + EIP-2612 interface
interface IERC20Permit {
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external;

    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @title Gasless ERC20 Transfer via Permit
/// @author Jason
/// @notice Allows gasless token transfers using EIP-2612 permit with relayer fee
contract GaslessTransfer {
    error ExpiredDeadline();
    error FeeTooHigh();
    error ZeroAmount();

    /// @notice Maximum fee allowed (optional safety guard)
    uint256 public constant MAX_FEE_BPS = 500; // 5%

    /// @notice Executes a gasless transfer using permit
    /// @param token ERC20 token address (must support EIP-2612)
    /// @param sender Token owner
    /// @param receiver Token recipient
    /// @param amount Token amount to send
    /// @param fee Fee paid to relayer
    /// @param deadline Permit expiration
    /// @param v Signature v
    /// @param r Signature r
    /// @param s Signature s
    function sendWithPermit(
        address token,
        address sender,
        address receiver,
        uint256 amount,
        uint256 fee,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > deadline) revert ExpiredDeadline();
        if (amount == 0) revert ZeroAmount();

        // Optional fee protection (fee <= 5% of amount)
        if (fee * 10_000 > amount * MAX_FEE_BPS) {
            revert FeeTooHigh();
        }

        uint256 total = amount + fee;

        // 1. Permit approval (off-chain signature)
        IERC20Permit(token).permit(sender, address(this), total, deadline, v, r, s);

        // 2. Transfer tokens to receiver
        IERC20Permit(token).transferFrom(sender, receiver, amount);

        // 3. Pay relayer fee
        if (fee > 0) {
            IERC20Permit(token).transferFrom(sender, msg.sender, fee);
        }
    }
}
