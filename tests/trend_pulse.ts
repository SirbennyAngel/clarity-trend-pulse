import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test trend creation and retrieval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    const block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'create-trend', [
        types.ascii("NFT Gaming"),
        types.ascii("gaming"),
        types.ascii("Description here"),
        types.principal(deployer.address)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(0);
    
    const response = chain.callReadOnlyFn(
      'trend-pulse',
      'get-trend',
      [types.uint(0)],
      deployer.address
    );
    
    const trend = response.result.expectSome().expectTuple();
    assertEquals(trend['title'].value, "NFT Gaming");
    assertEquals(trend['votes'].value, "0");
    assertEquals(trend['upvotes'].value, "0");
    assertEquals(trend['downvotes'].value, "0");
  }
});

Clarinet.test({
  name: "Test voting mechanics and vote counting",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    
    // Create trend
    let block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'create-trend', [
        types.ascii("NFT Gaming"),
        types.ascii("gaming"),
        types.ascii("Description here"),
        types.principal(deployer.address)
      ], deployer.address)
    ]);
    
    // Test upvote
    block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'vote-trend', [
        types.uint(0),
        types.bool(true),
        types.principal(user1.address)
      ], user1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Test downvote
    block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'vote-trend', [
        types.uint(0),
        types.bool(false),
        types.principal(user2.address)
      ], user2.address)
    ]);
    
    // Verify vote counts
    const response = chain.callReadOnlyFn(
      'trend-pulse',
      'get-trend',
      [types.uint(0)],
      deployer.address
    );
    
    const trend = response.result.expectSome().expectTuple();
    assertEquals(trend['votes'].value, "2");
    assertEquals(trend['upvotes'].value, "1");
    assertEquals(trend['downvotes'].value, "1");
  }
});

Clarinet.test({
  name: "Test category list overflow protection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Create 51 trends (should fail on the 51st)
    const transactions = [];
    for (let i = 0; i < 51; i++) {
      transactions.push(
        Tx.contractCall('trend-pulse', 'create-trend', [
          types.ascii(`Trend ${i}`),
          types.ascii("gaming"),
          types.ascii("Description"),
          types.principal(deployer.address)
        ], deployer.address)
      );
    }
    
    const block = chain.mineBlock(transactions);
    assertEquals(block.receipts.length, 51);
    block.receipts[50].result.expectErr().expectUint(103); // ERR-CATEGORY-FULL
  }
});
