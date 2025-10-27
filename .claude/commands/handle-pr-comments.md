---
argument-hint: [pr-num]
description: Read and handle comments on a PR
---

We're working on PR # $1. Some comments have been added. Let's review those comments and decide whether to take action on them.

Do not begin taking action on these comments until we have discussed them.

You have access to the GitHub CLI.

You will have to check the PR comments with `gh pr view $1 --comments`.

You may need to use the GraphQL API to view inline comments on specific lines of code. An example that has worked in the past is:

```
gh api graphql -f query='
query {
  repository(owner: "manwithoutsleep", name: "babawa.chat") {
    pullRequest(number: $1) {
      reviewThreads(first: 10) {
        nodes {
          comments(first: 10) {
            nodes {
              path
              line
              body
              author {
                login
              }
            }
          }
        }
      }
    }
  }
}'
```

After human approval:

1. Squash and merge the PR.
2. Checkout `main` locally
3. Pull the remote changes
4. Delete the remote branch this PR referenced.
5. Fetch and prune all remote-tracking references which no longer exist on the remote.
