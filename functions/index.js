const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const lunr = require('lunr');

exports.searchFirestore = functions.firestore
    .document('tocha_searches/{searchId}')
    .onCreate(async (snap, context) => {
        // Obtain the request parameters
        const req = snap.data();
        const collectionName = req.collectionName;
        const fields = req.fields;
        const query = req.query;
        const queryRef = req.queryRef;

        // Read all the documents form the collection to be searched
        const querySnapshot = await admin.firestore().collection(collectionName).get();
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
        return admin.firestore().collection("tocha_searches").doc(context.params.searchId)
            .update({
                response: response,
                responseTimestamp: admin.firestore.FieldValue.serverTimestamp()
            });
    });
