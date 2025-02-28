;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-TREND (err u101))
(define-constant ERR-ALREADY-VOTED (err u102))

;; Data variables
(define-data-var next-trend-id uint u0)

;; Data maps
(define-map trends 
  uint 
  {
    title: (string-ascii 50),
    category: (string-ascii 20),
    description: (string-ascii 200),
    creator: principal,
    votes: uint,
    created-at: uint,
    is-active: bool
  }
)

(define-map user-votes 
  { user: principal, trend-id: uint } 
  bool
)

(define-map category-trends 
  (string-ascii 20) 
  (list 50 uint)
)

;; Create new trend
(define-public (create-trend (title (string-ascii 50)) (category (string-ascii 20)) (description (string-ascii 200)) (creator principal))
  (let ((trend-id (var-get next-trend-id)))
    (try! (create-trend-data trend-id title category description creator))
    (try! (add-to-category category trend-id))
    (var-set next-trend-id (+ trend-id u1))
    (ok trend-id)
  )
)

;; Vote on trend
(define-public (vote-trend (trend-id uint) (vote-up bool) (voter principal))
  (let ((trend (get-trend trend-id)))
    (asserts! (is-some trend) ERR-INVALID-TREND)
    (asserts! (not (has-voted voter trend-id)) ERR-ALREADY-VOTED)
    (try! (record-vote trend-id vote-up voter))
    (ok true)
  )
)

;; Helper functions
(define-private (create-trend-data (id uint) (title (string-ascii 50)) (category (string-ascii 20)) (description (string-ascii 200)) (creator principal))
  (map-set trends id {
    title: title,
    category: category,
    description: description,
    creator: creator,
    votes: u0,
    created-at: block-height,
    is-active: true
  })
  (ok true)
)

(define-private (record-vote (trend-id uint) (vote-up bool) (voter principal))
  (map-set user-votes { user: voter, trend-id: trend-id } vote-up)
  (ok true)
)

(define-private (add-to-category (category (string-ascii 20)) (trend-id uint))
  (let ((current-trends (default-to (list) (map-get? category-trends category))))
    (map-set category-trends category (append current-trends trend-id))
    (ok true)
  )
)

;; Read only functions
(define-read-only (get-trend (trend-id uint))
  (map-get? trends trend-id)
)

(define-read-only (get-trends-by-category (category (string-ascii 20)))
  (map-get? category-trends category)
)

(define-read-only (has-voted (user principal) (trend-id uint))
  (is-some (map-get? user-votes { user: user, trend-id: trend-id }))
)
