import { describe, it, expect, beforeEach } from "vitest";
import { ClarityValue, noneCV, someCV, stringUtf8CV, uintCV, principalCV, buffCV, tupleCV, boolCV, optionalCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_PROPOSAL_DESCRIPTION = 101;
const ERR_INVALID_URGENCY_LEVEL = 102;
const ERR_INVALID_VOTING_PERIOD = 103;
const ERR_PROPOSAL_ALREADY_EXISTS = 104;
const ERR_PROPOSAL_NOT_FOUND = 105;
const ERR_VOTING_CLOSED = 106;
const ERR_ALREADY_VOTED = 107;
const ERR_INSUFFICIENT_STAKE = 108;
const ERR_QUORUM_NOT_MET = 109;
const ERR_MAJORITY_NOT_MET = 110;
const ERR_EXECUTION_FAILED = 111;
const ERR_INVALID_NEEDS_DATA_HASH = 112;
const ERR_INVALID_DEPLOYMENT_PARAMS = 113;
const ERR_EMERGENCY_NOT_VERIFIED = 114;
const ERR_INVALID_TIMELOCK = 115;
const ERR_PROPOSAL_EXPIRED = 116;
const ERR_INVALID_VOTER_WEIGHT = 117;
const ERR_MAX_PROPOSALS_EXCEEDED = 118;
const ERR_INVALID_STATUS = 119;
const ERR_INVALID_CATEGORY = 120;
const ERR_INVALID_LOCATION = 121;
const ERR_INVALID_REQUIRED_VOLUNTEERS = 122;
const ERR_INVALID_REWARD_AMOUNT = 123;
const ERR_TREASURY_NOT_SET = 124;
const ERR_STAKING_NOT_SET = 125;
const ERR_DEPLOYMENT_MANAGER_NOT_SET = 126;
const ERR_REWARD_DISTRIBUTOR_NOT_SET = 127;
const ERR_ORACLE_NOT_SET = 128;
const ERR_INVALID_ORACLE_DATA = 129;
const ERR_INVALID_EXECUTION_DELAY = 130;

interface Proposal {
  description: string;
  urgencyLevel: number;
  votingStart: number;
  votingEnd: number;
  needsDataHash: Buffer;
  category: string;
  location: string;
  requiredVolunteers: number;
  rewardAmount: number;
  votesFor: number;
  votesAgainst: number;
  status: number;
  proposer: string;
  executedAt: number | null;
}

type VoteKey = { proposalId: number; voter: string };

interface Result<T> {
  ok: boolean;
  value: T;
}

class GovernanceDAOMock {
  state: {
    nextProposalId: number;
    maxProposals: number;
    minVotingPeriod: number;
    maxVotingPeriod: number;
    quorumThreshold: number;
    majorityThreshold: number;
    proposalFee: number;
    emergencyThreshold: number;
    timelockDuration: number;
    treasuryContract: string;
    stakingContract: string;
    deploymentManagerContract: string;
    rewardDistributorContract: string;
    needsDataOracleContract: string;
    proposals: Map<number, Proposal>;
    votes: Map<string, boolean>;
    voterWeights: Map<string, number>;
  } = {
    nextProposalId: 0,
    maxProposals: 10000,
    minVotingPeriod: 144,
    maxVotingPeriod: 10080,
    quorumThreshold: 50,
    majorityThreshold: 51,
    proposalFee: 1000,
    emergencyThreshold: 75,
    timelockDuration: 144,
    treasuryContract: "SP000000000000000000002Q6VF78",
    stakingContract: "SP000000000000000000002Q6VF78",
    deploymentManagerContract: "SP000000000000000000002Q6VF78",
    rewardDistributorContract: "SP000000000000000000002Q6VF78",
    needsDataOracleContract: "SP000000000000000000002Q6VF78",
    proposals: new Map(),
    votes: new Map(),
    voterWeights: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  stxTransfers: Array<{ amount: number; from: string; to: string }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextProposalId: 0,
      maxProposals: 10000,
      minVotingPeriod: 144,
      maxVotingPeriod: 10080,
      quorumThreshold: 50,
      majorityThreshold: 51,
      proposalFee: 1000,
      emergencyThreshold: 75,
      timelockDuration: 144,
      treasuryContract: "SP000000000000000000002Q6VF78",
      stakingContract: "SP000000000000000000002Q6VF78",
      deploymentManagerContract: "SP000000000000000000002Q6VF78",
      rewardDistributorContract: "SP000000000000000000002Q6VF78",
      needsDataOracleContract: "SP000000000000000000002Q6VF78",
      proposals: new Map(),
      votes: new Map(),
      voterWeights: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.stxTransfers = [];
  }

  getProposal(id: number): Proposal | null {
    return this.state.proposals.get(id) || null;
  }

  hasVoted(id: number, voter: string): boolean {
    const key = `${id}-${voter}`;
    return this.state.votes.has(key);
  }

  getVoteWeight(id: number, voter: string): number {
    const key = `${id}-${voter}`;
    return this.state.voterWeights.get(key) || 0;
  }

  setTreasuryContract(newTreasury: string): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.treasuryContract = newTreasury;
    return { ok: true, value: true };
  }

  setStakingContract(newStaking: string): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.stakingContract = newStaking;
    return { ok: true, value: true };
  }

  setDeploymentManagerContract(newManager: string): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.deploymentManagerContract = newManager;
    return { ok: true, value: true };
  }

  setRewardDistributorContract(newDistributor: string): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.rewardDistributorContract = newDistributor;
    return { ok: true, value: true };
  }

  setNeedsDataOracleContract(newOracle: string): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.needsDataOracleContract = newOracle;
    return { ok: true, value: true };
  }

  setQuorumThreshold(newQuorum: number): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newQuorum < 1 || newQuorum > 100) return { ok: false, value: ERR_QUORUM_NOT_MET };
    this.state.quorumThreshold = newQuorum;
    return { ok: true, value: true };
  }

  setMajorityThreshold(newMajority: number): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newMajority < 1 || newMajority > 100) return { ok: false, value: ERR_MAJORITY_NOT_MET };
    this.state.majorityThreshold = newMajority;
    return { ok: true, value: true };
  }

  setProposalFee(newFee: number): Result<boolean> {
    if (this.caller !== "ST1TEST") return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.proposalFee = newFee;
    return { ok: true, value: true };
  }

  createProposal(
    description: string,
    urgencyLevel: number,
    votingPeriod: number,
    needsDataHash: Buffer,
    category: string,
    location: string,
    requiredVolunteers: number,
    rewardAmount: number
  ): Result<number> {
    if (this.state.nextProposalId >= this.state.maxProposals) return { ok: false, value: ERR_MAX_PROPOSALS_EXCEEDED };
    if (!description || description.length > 500) return { ok: false, value: ERR_INVALID_PROPOSAL_DESCRIPTION };
    if (urgencyLevel < 1 || urgencyLevel > 5) return { ok: false, value: ERR_INVALID_URGENCY_LEVEL };
    if (votingPeriod < this.state.minVotingPeriod || votingPeriod > this.state.maxVotingPeriod) return { ok: false, value: ERR_INVALID_VOTING_PERIOD };
    if (needsDataHash.length !== 32) return { ok: false, value: ERR_INVALID_NEEDS_DATA_HASH };
    if (!["disaster", "community", "health", "education", "environment"].includes(category)) return { ok: false, value: ERR_INVALID_CATEGORY };
    if (!location || location.length > 100) return { ok: false, value: ERR_INVALID_LOCATION };
    if (requiredVolunteers <= 0) return { ok: false, value: ERR_INVALID_REQUIRED_VOLUNTEERS };
    if (rewardAmount < 0) return { ok: false, value: ERR_INVALID_REWARD_AMOUNT };

    this.stxTransfers.push({ amount: this.state.proposalFee, from: this.caller, to: this.state.treasuryContract });

    const id = this.state.nextProposalId;
    const proposal: Proposal = {
      description,
      urgencyLevel,
      votingStart: this.blockHeight,
      votingEnd: this.blockHeight + votingPeriod,
      needsDataHash,
      category,
      location,
      requiredVolunteers,
      rewardAmount,
      votesFor: 0,
      votesAgainst: 0,
      status: 0,
      proposer: this.caller,
      executedAt: null,
    };
    this.state.proposals.set(id, proposal);
    this.state.nextProposalId++;
    return { ok: true, value: id };
  }

  voteOnProposal(id: number, voteFor: boolean): Result<boolean> {
    const proposal = this.state.proposals.get(id);
    if (!proposal) return { ok: false, value: ERR_PROPOSAL_NOT_FOUND };
    if (this.blockHeight < proposal.votingStart || this.blockHeight > proposal.votingEnd) return { ok: false, value: ERR_VOTING_CLOSED };
    const voteKey = `${id}-${this.caller}`;
    if (this.state.votes.has(voteKey)) return { ok: false, value: ERR_ALREADY_VOTED };
    const weight = 1;
    if (weight <= 0) return { ok: false, value: ERR_INSUFFICIENT_STAKE };

    this.state.votes.set(voteKey, voteFor);
    this.state.voterWeights.set(voteKey, weight);
    if (voteFor) {
      proposal.votesFor += weight;
    } else {
      proposal.votesAgainst += weight;
    }
    this.state.proposals.set(id, proposal);
    return { ok: true, value: true };
  }

  executeProposal(id: number): Result<boolean> {
    const proposal = this.state.proposals.get(id);
    if (!proposal) return { ok: false, value: ERR_PROPOSAL_NOT_FOUND };
    if (this.blockHeight <= proposal.votingEnd) return { ok: false, value: ERR_VOTING_CLOSED };
    if (proposal.status !== 0) return { ok: false, value: ERR_INVALID_STATUS };
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    const totalStake = 100;
    const quorumMet = (totalVotes * 100) >= (totalStake * this.state.quorumThreshold);
    const majorityMet = (proposal.votesFor * 100) >= (totalVotes * this.state.majorityThreshold);
    if (!quorumMet) return { ok: false, value: ERR_QUORUM_NOT_MET };
    if (!majorityMet) return { ok: false, value: ERR_MAJORITY_NOT_MET };

    proposal.status = 1;
    proposal.executedAt = this.blockHeight;
    this.state.proposals.set(id, proposal);
    return { ok: true, value: true };
  }

  emergencyExecute(id: number, oracleSignature: Buffer): Result<boolean> {
    const proposal = this.state.proposals.get(id);
    if (!proposal) return { ok: false, value: ERR_PROPOSAL_NOT_FOUND };
    if (proposal.urgencyLevel < 4) return { ok: false, value: ERR_EMERGENCY_NOT_VERIFIED };
    if (proposal.status !== 0) return { ok: false, value: ERR_INVALID_STATUS };

    proposal.status = 2;
    proposal.executedAt = this.blockHeight;
    this.state.proposals.set(id, proposal);
    return { ok: true, value: true };
  }

  getProposalCount(): Result<number> {
    return { ok: true, value: this.state.nextProposalId };
  }
}

describe("GovernanceDAO", () => {
  let contract: GovernanceDAOMock;

  beforeEach(() => {
    contract = new GovernanceDAOMock();
    contract.reset();
  });

  it("creates a proposal successfully", () => {
    const hash = Buffer.alloc(32);
    const result = contract.createProposal(
      "Test Proposal",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);

    const proposal = contract.getProposal(0);
    expect(proposal?.description).toBe("Test Proposal");
    expect(proposal?.urgencyLevel).toBe(3);
    expect(proposal?.votingStart).toBe(0);
    expect(proposal?.votingEnd).toBe(200);
    expect(proposal?.category).toBe("disaster");
    expect(proposal?.location).toBe("LocationX");
    expect(proposal?.requiredVolunteers).toBe(50);
    expect(proposal?.rewardAmount).toBe(1000);
    expect(proposal?.votesFor).toBe(0);
    expect(proposal?.votesAgainst).toBe(0);
    expect(proposal?.status).toBe(0);
    expect(proposal?.proposer).toBe("ST1TEST");
    expect(proposal?.executedAt).toBe(null);
    expect(contract.stxTransfers).toEqual([{ amount: 1000, from: "ST1TEST", to: "SP000000000000000000002Q6VF78" }]);
  });

  it("rejects invalid description", () => {
    const hash = Buffer.alloc(32);
    const longDesc = "a".repeat(501);
    const result = contract.createProposal(
      longDesc,
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_PROPOSAL_DESCRIPTION);
  });

  it("rejects invalid urgency level", () => {
    const hash = Buffer.alloc(32);
    const result = contract.createProposal(
      "Test",
      6,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_URGENCY_LEVEL);
  });

  it("rejects invalid voting period", () => {
    const hash = Buffer.alloc(32);
    const result = contract.createProposal(
      "Test",
      3,
      100,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_VOTING_PERIOD);
  });

  it("rejects invalid needs data hash", () => {
    const hash = Buffer.alloc(31);
    const result = contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_NEEDS_DATA_HASH);
  });

  it("rejects invalid category", () => {
    const hash = Buffer.alloc(32);
    const result = contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "invalid",
      "LocationX",
      50,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_CATEGORY);
  });

  it("rejects invalid location", () => {
    const hash = Buffer.alloc(32);
    const longLoc = "a".repeat(101);
    const result = contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      longLoc,
      50,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_LOCATION);
  });

  it("rejects invalid required volunteers", () => {
    const hash = Buffer.alloc(32);
    const result = contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      0,
      1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_REQUIRED_VOLUNTEERS);
  });

  it("rejects invalid reward amount", () => {
    const hash = Buffer.alloc(32);
    const result = contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      -1000
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_REWARD_AMOUNT);
  });

  it("votes on proposal successfully", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    contract.blockHeight = 50;
    const result = contract.voteOnProposal(0, true);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const proposal = contract.getProposal(0);
    expect(proposal?.votesFor).toBe(1);
    expect(contract.hasVoted(0, "ST1TEST")).toBe(true);
    expect(contract.getVoteWeight(0, "ST1TEST")).toBe(1);
  });

  it("rejects vote on non-existent proposal", () => {
    const result = contract.voteOnProposal(99, true);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_PROPOSAL_NOT_FOUND);
  });

  it("rejects vote outside voting period", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    contract.blockHeight = 201;
    const result = contract.voteOnProposal(0, true);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_VOTING_CLOSED);
  });

  it("rejects double vote", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    contract.blockHeight = 50;
    contract.voteOnProposal(0, true);
    const result = contract.voteOnProposal(0, false);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_ALREADY_VOTED);
  });

  it("rejects execution before voting ends", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    contract.blockHeight = 199;
    const result = contract.executeProposal(0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_VOTING_CLOSED);
  });

  it("rejects execution without quorum", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Test",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    contract.blockHeight = 201;
    const result = contract.executeProposal(0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_QUORUM_NOT_MET);
  });

  it("emergency executes successfully", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Emergency",
      4,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    const sig = Buffer.alloc(65);
    const result = contract.emergencyExecute(0, sig);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const proposal = contract.getProposal(0);
    expect(proposal?.status).toBe(2);
    expect(proposal?.executedAt).toBe(0);
  });

  it("rejects emergency for low urgency", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "LowUrgency",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    const sig = Buffer.alloc(65);
    const result = contract.emergencyExecute(0, sig);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_EMERGENCY_NOT_VERIFIED);
  });

  it("sets treasury contract", () => {
    const result = contract.setTreasuryContract("ST2NEW");
    expect(result.ok).toBe(true);
    expect(contract.state.treasuryContract).toBe("ST2NEW");
  });

  it("rejects unauthorized set treasury", () => {
    contract.caller = "ST3FAKE";
    const result = contract.setTreasuryContract("ST2NEW");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("sets quorum threshold", () => {
    const result = contract.setQuorumThreshold(60);
    expect(result.ok).toBe(true);
    expect(contract.state.quorumThreshold).toBe(60);
  });

  it("rejects invalid quorum", () => {
    const result = contract.setQuorumThreshold(0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_QUORUM_NOT_MET);
  });

  it("gets proposal count", () => {
    const hash = Buffer.alloc(32);
    contract.createProposal(
      "Test1",
      3,
      200,
      hash,
      "disaster",
      "LocationX",
      50,
      1000
    );
    contract.createProposal(
      "Test2",
      3,
      200,
      hash,
      "disaster",
      "LocationY",
      60,
      2000
    );
    const result = contract.getProposalCount();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });
});