const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();
firestore.settings({timestampsInSnapshots: true});

const lunr = require('lunr');

// Full Text-Search on Cloud Firestore
exports.searchFirestore = functions.firestore
    .document('tocha_searches/{searchId}')
    .onCreate(async (snap, context) => {
        // Obtain the request parameters
        const req = snap.data();
        const collectionName = req.collectionName;
        const fields = req.fields;
        const query = req.query;
        const queryRef = req.queryRef;

        // Read all the documents from the collection to be searched
        const querySnapshot = await firestore.collection(collectionName).get();
        var documents = [];
        var lunrIndex = lunr(function() {
            if (queryRef) {
                this.ref(queryRef);
            } else {
                this.ref('key');
            }
            for (var i in fields) {
                this.field(fields[i]);
            }
            querySnapshot.forEach(function (docSnapshot) {
                var snapshotData = docSnapshot.data();
                documents[docSnapshot.id] = docSnapshot.data();
                snapshotData.key = docSnapshot.id;
                this.add(snapshotData);
            }, this);
        });
        const results = lunrIndex.search(query);
        var response = [];
        results.forEach(function(result) {
            response.push({
                id: result.ref,
                score: result.score,
                data: documents[result.ref]
            })
        });
        return firestore.collection("tocha_searches").doc(context.params.searchId)
            .update({
                response: response,
                responseTimestamp: admin.firestore.FieldValue.serverTimestamp()
            });
    });

// Full Text-Search on the Realtime Database
exports.searchRTDB = functions.database
    .ref('tocha_searches/{searchId}')
    .onCreate((snap, context) => {
        // Obtain the request parameters
        const req = snap.val();
        const nodeName = req.collectionName;
        const fields = req.fields;
        const query = req.query;
        const queryRef = req.queryRef;

        // Read everything from the node to be searched
        const database = admin.database();
        return database.ref(nodeName)
            .once("value", function(dataSnapshot) {
                var documents = new Map();
                dataSnapshot.forEach(function (snapshot) {
                    var snapshotVal = snapshot.val();
                    snapshotVal.key = snapshot.key;
                    documents.set(snapshot.key, snapshotVal);
                });
                var lunrIndex = lunr(function () {
                    if (queryRef) { this.ref(queryRef); } else { this.ref('key'); }

                    for (var i in fields) { this.field(fields[i]); }

                    documents.forEach(function (value) { this.add(value); }, this);
                });
                const results = lunrIndex.search(query);
                const response = [];
                results.forEach(function (result) {
                    response.push({
                        id: result.ref,
                        score: result.score,
                        data: documents.get(result.ref)
                    });
                });
                database.ref("tocha_searches").child(context.params.searchId)
                    .update({
                        response: response,
                        responseTimestamp: admin.database.ServerValue.TIMESTAMP
                    });
            })
    });
