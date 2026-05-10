const {setGlobalOptions} = require("firebase-functions");
const {onValueCreated} = require("firebase-functions/v2/database");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({maxInstances: 10});

exports.syncSensorToFirestore = onValueCreated(
    "/sensors/{uid}/{pondId}/{sensorId}",
    async (event) => {
      const {uid, pondId, sensorId} = event.params;
      const data = event.data ? event.data.val() : null;

      if (!data) {
        logger.warn("RTDB create event had no data", {uid, pondId, sensorId});
        return null;
      }

      const createdAt =
        typeof data.createdAt === "number" ?
          admin.firestore.Timestamp.fromMillis(data.createdAt * 1000) :
          admin.firestore.FieldValue.serverTimestamp();

      const payload = {
        ph: data.ph,
        temperature: data.temperature,
        turbidity: data.turbidity,
        waterLevel: data.waterLevel,
        createdAt,
        source: "rtdb",
      };

      const docRef = admin
          .firestore()
          .doc(`users/${uid}/ponds/${pondId}/sensors/${sensorId}`);

      await docRef.set(payload, {merge: true});
      logger.info("Synced RTDB sensor to Firestore", {uid, pondId, sensorId});
      return null;
    },
);
