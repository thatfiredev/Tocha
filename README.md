# Tocha
Full-Text Search for Firebase through Cloud Functions, even if you're on the
 [Spark Plan](https://firebase.google.com/pricing/) (no billing enabled). 😉

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing
 purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

To install and deploy Tocha, you'll need:
- [Node.js](https://nodejs.org/en/download/), which comes with the Node Package Manager (npm);
- The [Firebase CLI](https://github.com/firebase/firebase-tools) which can be installed using
 `npm install -g firebase-tools`. See full installation details
 [on the Documentation](https://firebase.google.com/docs/cli/).

### Installing

Tocha runs on Cloud Functions, so you'll need to install the Firebase CLI (as instructed on the
 [Prerequisites](#Prerequisites)) in order to setup Cloud Functions for your Firebase Project.

_(If you already have Cloud Functions enabled for you project, you may skip to step 4.)_

1. Create a new directory on your local machine for the project and navigate into it:
    ```bash
    mkdir my_tocha_project
    cd my_tocha_project
    ```

2. If you haven't already, login to Firebase:
   ```bash
   firebase login
   ```
   This will launch a web page for you to authenticate to your Firebase Account.
    
3. Initialize and configure your Firebase Project. In this step, you'll be asked what project you'll be using and what
 features you would like to setup (be sure to select `functions` at least).
   ```bash
   firebase init
   ```
   If successful, this should create 2 files under your project directory: `package.json` and `index.js`.
   
4. Open the `package.json` file on your favorite text editor and make sure you have set node version to 8 and added the
 following dependencies:
    ```json5
    {
    // ... name, description, version, etc 
    "dependencies": {
      "firebase-admin": "~6.0.0",
      "firebase-functions": "^2.1.0",
      "tocha": ">=0.0.2"
      },
    "engines": {
      "node": "8"
      }
    }
    ```

5. Now open the `index.js` file on the text editor, import Tocha and export the functions you need:
    ```js
    const functions = require('firebase-functions');
    // ... you may have more imports here ...
    const tocha = require('tocha');
    
    // Add this line to enable Full-Text Search for Cloud Firestore
    exports.searchFirestore = tocha.searchFirestore;
    
    // Add this line to enable Full-Text Search for the Realtime Database
    exports.searchRTDB = tocha.searchRTDB;
 
    // ... you may have more cloud functions here ...
    ```
    
6. Finally, install all the npm dependencies using:
    ```bash
    npm install
    ```
    If this fails, you can try installing them manually:
    ```bash
        npm install firebase-admin
        npm install firebase-functions
        npm install tocha
    ```

## Deployment

To deploy your functions to Firebase, you can either:
- deploy the cloud functions and all the other tools you have enabled for that project:
```bash
firebase deploy
```
- or deploy the cloud functions only
```bash
firebase deploy --only functions
```

## Example
Let's say we have a Firestore Collection named "notes" with the following Documents:
```json
{
  "note1": {
    "title": "Remember to buy butter",
    "description": "Valeria asked me to get some butter at the supermarket on my way home."
  },
  "note2": {
    "title": "Eta's birthday coming up",
    "description": "Eta is turning 28 this Friday. Don't forget to call her wishing HBD."
  }
}
```

### Performing a Simple Search
In order to search the collection, you'll need to create a new collection named "tocha_searches" and add a new document
 to it. This document should contain the following fields:
 - `collectionName` - the name of the collection to be searched;
 - `fields` - array of fields to search on.
 - `query` - the word/expression you're looking for.

**Example 1:** Let's run an exact search for notes with the word "butter". Our document would look like this:
```json
{
  "collectionName": "notes",
  "fields": ["title"],
  "query": "butter"
}
```

**Example 2:** Sometimes you may need an inexact search. Let's look for the note about Eta's birthday:
```json
{
  "collectionName": "notes",
  "fields": ["title", "description"],
  "query": "Eta*"
}
```

Notice that on the last example we've used the wildcard `*`. You can find the
 [list of all possible wildcards, boosts and fuzzy matchings here](https://lunrjs.com/guides/searching.html).

---

Adding that document to the collection should trigger our Cloud Function which adds a `response` field to it.
 This field is an array of matches. Each match contains the following fields:
 - `id` - the id of the document that matches our query;
 - `score` - the relevance of the document, calculated using the [BM25](https://en.wikipedia.org/wiki/Okapi_BM25)
 algorithm. Find out more [here](https://lunrjs.com/guides/searching.html#scoring).
 - `data` - the actual document returned by our query.
 
So our document from Example 1 would become:
```json
{
  "collectionName": "notes",
  "fields": ["title"],
  "query": "butter",
  "response": {
    "result": [
      {
        "id": "note1",
        "score": 0.856,
        "data": {
          "title": "Remember to buy butter",
          "description": "Valeria asked me to get some butter at the supermarket on my way home."
        }
      }
    ],
    "isSuccessful": true
  }
}
```

### Advanced Search on Cloud Firestore
Although running a text-search in the whole collection is great, sometimes you may need to filter this collection before
 running the search. And to do that, you can use these optional parameters:
 
#### `where`
An array of map values where you can perform simple or compound queries for firestore. Each map in this array must
 contain the following fields:
 - `field` - the field to filter on.
 - `operator` - a comparison operator. This can be `<`, `<=`, `==`, `>`, `>=`, or `array_contains`.
 - `val` - the value.
 
**Example:** Suppose our notes had one more field named `ownerUID`, which tells us which user created the note.

We might want to query only on the notes created by a specific user (`uid: randomUserUID`). To do that, we can use:
```json5
{
  // ... Other Fields (collectionName, fields, query, etc)
  "where": [
    {
      "field": "ownerUID",
      "operator": "==",
      "val": "randomUserUID"
    }
    // Optionally, you can add more filter maps here.
  ]
}
```

See a full list of valid filters and query limitations on the
 [Firebase Documentation](https://firebase.google.com/docs/firestore/query-data/queries).

#### `orderBy` and `limit`
The `orderBy` field allows you to order the result of your query. This field is an array of map objects with 2 fields:
 - `field` - the field to sort on.
 - `direction` (optional) - `asc` for ascending order or `desc` for descending. If you omit this field, it will use
 ascending order.

**Note:** If you want to order by multiple fields you might need to
 [Create an Index on Firestore](https://firebase.google.com/docs/firestore/query-data/indexing).
 
The `limit` field allows you to limit the number of documents retrieved. This value of this field must be a number.

**Example:** Let's order our notes by `title` and get the first 5:
```json5
{
  // ... Other Fields (collectionName, fields, query, etc)
  "orderBy": [
    {
      "field": "title",
      "direction": "desc"
    }
    // Optionally, you can add more orderBy maps here.
  ],
  "limit": 5
}
```


## Contributing

Anyone and everyone is welcome to contribute. Please take a moment to review the
 [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT LICENSE](LICENSE).

## Acknowledgments

- This project makes use of the [Lunr.js](https://github.com/olivernn/lunr.js) library by
 [Oliver Nightingale](https://github.com/olivernn).
