// EpochLedger Synchronization System
// Rule-driven consensus simulation with phased execution design

// ---------------- LEDGER CORE ----------------
class Ledger {
    constructor() {
        this.chain = [];
        this.height = 0;
    }

    commit(block) {
        this.chain.push({
            index: this.height++,
            payload: block.payload,
            approvals: block.approvals,
            finalizedAt: Date.now()
        });
    }

    view() {
        return this.chain;
    }
}

// ---------------- VALIDATOR NODE ----------------
class Validator {
    constructor(identifier, stakePower) {
        this.identifier = identifier;
        this.stakePower = stakePower;
        this.reliability = 1.0;
    }

    score() {
        // Weighted scoring model based on stake and reliability
        return this.stakePower * this.reliability;
    }

    evaluate(candidate) {
        // Rule-based approval decision
        const threshold = candidate.difficultyThreshold;
        return this.score() >= threshold;
    }
}

// ---------------- STAKING LAYER ----------------
class StakingLayer {
    constructor() {
        this.nodes = new Set();
    }

    addValidator(id, stake) {
        this.nodes.add(new Validator(id, stake));
    }

    list() {
        return Array.from(this.nodes);
    }

    aggregateStake() {
        return this.list().reduce((sum, n) => sum + n.stakePower, 0);
    }
}

// ---------------- CONSENSUS ORCHESTRATOR ----------------
class ConsensusEngine {
    constructor(stakingLayer, ledger) {
        this.stakingLayer = stakingLayer;
        this.ledger = ledger;
        this.epochCounter = 0;
    }

    generateBlock(data) {
        return {
            payload: data,
            approvals: [],
            difficultyThreshold: this.stakingLayer.aggregateStake() * 0.3
        };
    }

    runEpoch(block) {
        const validators = this.stakingLayer.list();
        const results = [];

        // Independent validator evaluation phase
        for (const v of validators) {
            const approved = v.evaluate(block);
            if (approved) {
                results.push(v.identifier);
            }
        }

        block.approvals = results;

        // Consensus rule: quorum-based acceptance
        const quorum = Math.ceil(validators.length / 2);

        if (results.length >= quorum) {
            this.ledger.commit(block);
            console.log(`Epoch ${this.epochCounter++}: Block committed`);
        } else {
            console.log(`Epoch ${this.epochCounter++}: Block rejected`);
        }
    }
}

// ---------------- SIMULATION BOOTSTRAP ----------------

// Initialize system components
const ledger = new Ledger();
const staking = new StakingLayer();
const engine = new ConsensusEngine(staking, ledger);

// Register validators
staking.addValidator("Node-X", 60);
staking.addValidator("Node-Y", 40);
staking.addValidator("Node-Z", 75);
staking.addValidator("Node-W", 55);

// Create and process blocks
const blockA = engine.generateBlock("Transaction Batch A");
const blockB = engine.generateBlock("Configuration Update");
const blockC = engine.generateBlock("Reward Distribution");

// Run consensus epochs
engine.runEpoch(blockA);
engine.runEpoch(blockB);
engine.runEpoch(blockC);

// Final ledger output
console.log("\n--- FINAL LEDGER ---");
console.log(ledger.view());
