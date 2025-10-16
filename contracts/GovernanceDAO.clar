(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-PROPOSAL-DESCRIPTION u101)
(define-constant ERR-INVALID-URGENCY-LEVEL u102)
(define-constant ERR-INVALID-VOTING-PERIOD u103)
(define-constant ERR-PROPOSAL-ALREADY-EXISTS u104)
(define-constant ERR-PROPOSAL-NOT-FOUND u105)
(define-constant ERR-VOTING-CLOSED u106)
(define-constant ERR-ALREADY-VOTED u107)
(define-constant ERR-INSUFFICIENT-STAKE u108)
(define-constant ERR-QUORUM-NOT-MET u109)
(define-constant ERR-MAJORITY-NOT-MET u110)
(define-constant ERR-EXECUTION-FAILED u111)
(define-constant ERR-INVALID-NEEDS-DATA-HASH u112)
(define-constant ERR-INVALID-DEPLOYMENT-PARAMS u113)
(define-constant ERR-EMERGENCY-NOT-VERIFIED u114)
(define-constant ERR-INVALID-TIMELOCK u115)
(define-constant ERR-PROPOSAL-EXPIRED u116)
(define-constant ERR-INVALID-VOTER-WEIGHT u117)
(define-constant ERR-MAX-PROPOSALS-EXCEEDED u118)
(define-constant ERR-INVALID-STATUS u119)
(define-constant ERR-INVALID-CATEGORY u120)
(define-constant ERR-INVALID-LOCATION u121)
(define-constant ERR-INVALID-REQUIRED-VOLUNTEERS u122)
(define-constant ERR-INVALID-REWARD-AMOUNT u123)
(define-constant ERR-TREASURY-NOT-SET u124)
(define-constant ERR-STAKING-NOT-SET u125)
(define-constant ERR-DEPLOYMENT-MANAGER-NOT-SET u126)
(define-constant ERR-REWARD-DISTRIBUTOR-NOT-SET u127)
(define-constant ERR-ORACLE-NOT-SET u128)
(define-constant ERR-INVALID-ORACLE-DATA u129)
(define-constant ERR-INVALID-EXECUTION-DELAY u130)

(define-data-var next-proposal-id uint u0)
(define-data-var max-proposals uint u10000)
(define-data-var min-voting-period uint u144)
(define-data-var max-voting-period uint u10080)
(define-data-var quorum-threshold uint u50)
(define-data-var majority-threshold uint u51)
(define-data-var proposal-fee uint u1000)
(define-data-var emergency-threshold uint u75)
(define-data-var timelock-duration uint u144)
(define-data-var treasury-contract principal 'SP000000000000000000002Q6VF78)
(define-data-var staking-contract principal 'SP000000000000000000002Q6VF78)
(define-data-var deployment-manager-contract principal 'SP000000000000000000002Q6VF78)
(define-data-var reward-distributor-contract principal 'SP000000000000000000002Q6VF78)
(define-data-var needs-data-oracle-contract principal 'SP000000000000000000002Q6VF78)

(define-map proposals
  uint
  {
    description: (string-utf8 500),
    urgency-level: uint,
    voting-start: uint,
    voting-end: uint,
    needs-data-hash: (buff 32),
    category: (string-utf8 50),
    location: (string-utf8 100),
    required-volunteers: uint,
    reward-amount: uint,
    votes-for: uint,
    votes-against: uint,
    status: uint,
    proposer: principal,
    executed-at: (optional uint)
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  bool
)

(define-map voter-weights
  { proposal-id: uint, voter: principal }
  uint
)

(define-read-only (get-proposal (id uint))
  (map-get? proposals id)
)

(define-read-only (has-voted (id uint) (voter principal))
  (is-some (map-get? votes { proposal-id: id, voter: voter }))
)

(define-read-only (get-vote-weight (id uint) (voter principal))
  (default-to u0 (map-get? voter-weights { proposal-id: id, voter: voter }))
)

(define-private (validate-description (desc (string-utf8 500)))
  (if (and (> (len desc) u0) (<= (len desc) u500))
      (ok true)
      (err ERR-INVALID-PROPOSAL-DESCRIPTION))
)

(define-private (validate-urgency-level (level uint))
  (if (and (>= level u1) (<= level u5))
      (ok true)
      (err ERR-INVALID-URGENCY-LEVEL))
)

(define-private (validate-voting-period (period uint))
  (if (and (>= period (var-get min-voting-period)) (<= period (var-get max-voting-period)))
      (ok true)
      (err ERR-INVALID-VOTING-PERIOD))
)

(define-private (validate-needs-data-hash (hash (buff 32)))
  (if (is-eq (len hash) u32)
      (ok true)
      (err ERR-INVALID-NEEDS-DATA-HASH))
)

(define-private (validate-category (cat (string-utf8 50)))
  (if (or (is-eq cat "disaster") (is-eq cat "community") (is-eq cat "health") (is-eq cat "education") (is-eq cat "environment"))
      (ok true)
      (err ERR-INVALID-CATEGORY))
)

(define-private (validate-location (loc (string-utf8 100)))
  (if (and (> (len loc) u0) (<= (len loc) u100))
      (ok true)
      (err ERR-INVALID-LOCATION))
)

(define-private (validate-required-volunteers (num uint))
  (if (> num u0)
      (ok true)
      (err ERR-INVALID-REQUIRED-VOLUNTEERS))
)

(define-private (validate-reward-amount (amount uint))
  (if (>= amount u0)
      (ok true)
      (err ERR-INVALID-REWARD-AMOUNT))
)

(define-private (validate-status (status uint))
  (if (or (is-eq status u0) (is-eq status u1) (is-eq status u2) (is-eq status u3) (is-eq status u4))
      (ok true)
      (err ERR-INVALID-STATUS))
)

(define-private (is-voting-open (proposal { description: (string-utf8 500), urgency-level: uint, voting-start: uint, voting-end: uint, needs-data-hash: (buff 32), category: (string-utf8 50), location: (string-utf8 100), required-volunteers: uint, reward-amount: uint, votes-for: uint, votes-against: uint, status: uint, proposer: principal, executed-at: (optional uint) }))
  (and (>= block-height (get voting-start proposal)) (<= block-height (get voting-end proposal)))
)

(define-private (calculate-voter-weight (voter principal))
  (ok u1)
)

(define-private (execute-deployment (id uint) (proposal { description: (string-utf8 500), urgency-level: uint, voting-start: uint, voting-end: uint, needs-data-hash: (buff 32), category: (string-utf8 50), location: (string-utf8 100), required-volunteers: uint, reward-amount: uint, votes-for: uint, votes-against: uint, status: uint, proposer: principal, executed-at: (optional uint) }))
  (ok true)
)

(define-public (set-treasury-contract (new-treasury principal))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (var-set treasury-contract new-treasury)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-staking-contract (new-staking principal))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (var-set staking-contract new-staking)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-deployment-manager-contract (new-manager principal))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (var-set deployment-manager-contract new-manager)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-reward-distributor-contract (new-distributor principal))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (var-set reward-distributor-contract new-distributor)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-needs-data-oracle-contract (new-oracle principal))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (var-set needs-data-oracle-contract new-oracle)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-quorum-threshold (new-quorum uint))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (asserts! (and (>= new-quorum u1) (<= new-quorum u100)) (err ERR-INVALID-QUORUM))
        (var-set quorum-threshold new-quorum)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-majority-threshold (new-majority uint))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (asserts! (and (>= new-majority u1) (<= new-majority u100)) (err ERR-INVALID-MAJORITY))
        (var-set majority-threshold new-majority)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-proposal-fee (new-fee uint))
  (if (is-eq tx-sender (as-contract tx-sender))
      (begin
        (var-set proposal-fee new-fee)
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED))
)

(define-public (create-proposal
  (description (string-utf8 500))
  (urgency-level uint)
  (voting-period uint)
  (needs-data-hash (buff 32))
  (category (string-utf8 50))
  (location (string-utf8 100))
  (required-volunteers uint)
  (reward-amount uint)
)
  (let (
    (next-id (var-get next-proposal-id))
    (start block-height)
    (end (+ start voting-period))
  )
    (asserts! (< next-id (var-get max-proposals)) (err ERR-MAX-PROPOSALS-EXCEEDED))
    (try! (validate-description description))
    (try! (validate-urgency-level urgency-level))
    (try! (validate-voting-period voting-period))
    (try! (validate-needs-data-hash needs-data-hash))
    (try! (validate-category category))
    (try! (validate-location location))
    (try! (validate-required-volunteers required-volunteers))
    (try! (validate-reward-amount reward-amount))
    (try! (stx-transfer? (var-get proposal-fee) tx-sender (var-get treasury-contract)))
    (map-set proposals next-id
      {
        description: description,
        urgency-level: urgency-level,
        voting-start: start,
        voting-end: end,
        needs-data-hash: needs-data-hash,
        category: category,
        location: location,
        required-volunteers: required-volunteers,
        reward-amount: reward-amount,
        votes-for: u0,
        votes-against: u0,
        status: u0,
        proposer: tx-sender,
        executed-at: none
      }
    )
    (var-set next-proposal-id (+ next-id u1))
    (print { event: "proposal-created", id: next-id })
    (ok next-id)
  )
)

(define-public (vote-on-proposal (id uint) (vote-for bool))
  (let (
    (proposal-opt (get-proposal id))
  )
    (match proposal-opt proposal
      (begin
        (asserts! (is-voting-open proposal) (err ERR-VOTING-CLOSED))
        (asserts! (not (has-voted id tx-sender)) (err ERR-ALREADY-VOTED))
        (let (
          (weight (unwrap! (calculate-voter-weight tx-sender) (err ERR-INSUFFICIENT-STAKE)))
        )
          (asserts! (> weight u0) (err ERR-INSUFFICIENT-STAKE))
          (map-set votes { proposal-id: id, voter: tx-sender } vote-for)
          (map-set voter-weights { proposal-id: id, voter: tx-sender } weight)
          (if vote-for
            (map-set proposals id (merge proposal { votes-for: (+ (get votes-for proposal) weight) }))
            (map-set proposals id (merge proposal { votes-against: (+ (get votes-against proposal) weight) }))
          )
          (print { event: "vote-cast", id: id, voter: tx-sender, for: vote-for, weight: weight })
          (ok true)
        )
      )
      (err ERR-PROPOSAL-NOT-FOUND)
    )
  )
)

(define-public (execute-proposal (id uint))
  (let (
    (proposal-opt (get-proposal id))
  )
    (match proposal-opt proposal
      (begin
        (asserts! (> block-height (get voting-end proposal)) (err ERR-VOTING-CLOSED))
        (asserts! (is-eq (get status proposal) u0) (err ERR-INVALID-STATUS))
        (let (
          (total-votes (+ (get votes-for proposal) (get votes-against proposal)))
          (total-stake u100)
          (quorum-met (>= (* total-votes u100) (* total-stake (var-get quorum-threshold))))
          (majority-met (>= (* (get votes-for proposal) u100) (* total-votes (var-get majority-threshold))))
        )
          (asserts! quorum-met (err ERR-QUORUM-NOT-MET))
          (asserts! majority-met (err ERR-MAJORITY-NOT-MET))
          (try! (execute-deployment id proposal))
          (map-set proposals id (merge proposal { status: u1, executed-at: (some block-height) }))
          (print { event: "proposal-executed", id: id })
          (ok true)
        )
      )
      (err ERR-PROPOSAL-NOT-FOUND)
    )
  )
)

(define-public (emergency-execute (id uint) (oracle-signature (buff 65)))
  (let (
    (proposal-opt (get-proposal id))
  )
    (match proposal-opt proposal
      (begin
        (asserts! (>= (get urgency-level proposal) u4) (err ERR-EMERGENCY-NOT-VERIFIED))
        (asserts! (is-eq (get status proposal) u0) (err ERR-INVALID-STATUS))
        (try! (execute-deployment id proposal))
        (map-set proposals id (merge proposal { status: u2, executed-at: (some block-height) }))
        (print { event: "emergency-executed", id: id })
        (ok true)
      )
      (err ERR-PROPOSAL-NOT-FOUND)
    )
  )
)

(define-public (get-proposal-count)
  (ok (var-get next-proposal-id))
)