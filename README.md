# TrendPulse
A decentralized trend tracking system built on Stacks blockchain that allows tracking and analyzing trends across industries and social media.

## Features
- Create and track new trends
- Vote on trend relevance and momentum 
- Get trending topics by category
- View trend history and analytics
- Stake tokens to boost trend visibility

## Setup and Installation
1. Clone the repository
2. Install Clarinet (if not already installed)
3. Run `clarinet check` to verify the contract
4. Run `clarinet test` to run the test suite

## Usage Examples
```clarity
;; Create a new trend
(contract-call? .trend-pulse create-trend "NFT Gaming" "gaming" "Description here" 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Vote on a trend
(contract-call? .trend-pulse vote-trend u1 true 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Get trending topics by category
(contract-call? .trend-pulse get-trends-by-category "gaming")
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
