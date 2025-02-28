import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test trend creation",
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
  }
});

Clarinet.test({
  name: "Test trend voting",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    // Create trend first
    let block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'create-trend', [
        types.ascii("NFT Gaming"),
        types.ascii("gaming"),
        types.ascii("Description here"),
        types.principal(deployer.address)
      ], deployer.address)
    ]);
    
    // Test voting
    block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'vote-trend', [
        types.uint(0),
        types.bool(true),
        types.principal(user1.address)
      ], user1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Test duplicate vote
    block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'vote-trend', [
        types.uint(0),
        types.bool(true),
        types.principal(user1.address)
      ], user1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(102);
  }
});

Clarinet.test({
  name: "Test category trends",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Create multiple trends
    let block = chain.mineBlock([
      Tx.contractCall('trend-pulse', 'create-trend', [
        types.ascii("NFT Gaming"),
        types.ascii("gaming"),
        types.ascii("Description 1"),
        types.principal(deployer.address)
      ], deployer.address),
      Tx.contractCall('trend-pulse', 'create-trend', [
        types.ascii("Mobile Gaming"),
        types.ascii("gaming"), 
        types.ascii("Description 2"),
        types.principal(deployer.address)
      ], deployer.address)
    ]);
    
    const response = chain.callReadOnlyFn(
      'trend-pulse',
      'get-trends-by-category',
      [types.ascii("gaming")],
      deployer.address
    );
    
    const trends = response.result.expectSome();
    assertEquals(trends.list.length, 2);
  }
});
