# Tocha
Full-text search for Cloud Firestore through Cloud Functions, even if you're on the Spark plan. 😉

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

In order to get Tocha on your machine, follow these instructions:

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

## Contributing

Anyone and everyone is welcome to contribute. Please take a moment to review the
 [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT LICENSE](LICENSE).

## Acknowledgments

- Makes use of the [Lunr.js](https://github.com/olivernn/lunr.js) library by
 [Oliver Nightingale](https://github.com/olivernn).
