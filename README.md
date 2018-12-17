# Tocha
Full-Text Search for Cloud Firestore through Cloud Functions, even if you're on the
 [Spark Plan](https://firebase.google.com/pricing/) (no billing enabled). 😉

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing
 purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

To install Tocha, you'll need:
- [Node.js](https://nodejs.org/en/download/), which comes with the Node Package Manager (npm);
- The [Firebase CLI](https://github.com/firebase/firebase-tools) which can be installed using
 `npm install -g firebase-tools`. See full installation details
 [on the Documentation](https://firebase.google.com/docs/cli/).

### Installing

#### If you've never setup a Cloud Function for your Firebase Project

1. [Download](https://github.com/rosariopfernandes/Tocha/archive/master.zip) the contents of the repository or clone it
 using git and navigate to it:
   ```bash
   # Clone the Project
   git clone https://github.com/rosariopfernandes/Tocha.git
   
   # Navigate to the directory
   cd Tocha
   
   ```

2. If you haven't already, login to Firebase:
   ```bash
   firebase login
   ```
   This will launch a webpage for you to authenticate to your Firebase Account.
    
3. Initialize and configure your Firebase Project. In this step, you'll be asked what features you want to setup
 (be sure to select `functions` at least) and what project will you be using.
   ```bash
   firebase init
   ```
   **DON'T** overwrite the existing package.json and index.js files.

#### If you already have some Cloud Functions on your Firebase Project
Then you're probably already familiarized with Cloud Functions. Simply open the [index.js file](functions/index.js)
 and copy the function you need to add to your project. You might need to also add the imports
 (first lines of that file).

## Deployment

To deploy your functions to Firebase, you can either:
- deploy the cloud functions and security rules
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
    "description": "Valeria asked ne to get some butter at the supermarket on my way home."
  },
  "note2": {
    "title": "Eta's birthday coming up",
    "description": "Eta is turning 28 this Friday. Don't forget to call her wishing HBD."
  }
}
```

### Performing the Search
In order to search the collection, you'll need to create a new collection named "tocha_searches" and add a new document
 to it. This document should contain the following fields:
 - `collectionName` - the name of the collection you want to search;
 - `fields` - fields where you want to search.
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
  "response": [
    {
      "id": "note1",
      "score": 0.856,
      "data": {
        "title": "Remember to buy butter",
        "description": "Valeria asked ne to get some butter at the supermarket on my way home."      
      }
    }
  ]
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
