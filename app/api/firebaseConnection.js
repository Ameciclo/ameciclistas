import db from "./firebaseAdmin";

export async function getProjects() {
  const ref = db.ref("projects");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function getSuppliers() {
  const ref = db.ref("recipients");
  const snapshot = await ref.once("value");
  return snapshot.val();
}

export async function savePaymentRequest(paymentRequest) {
  paymentRequest.date = new Date().getTime();
  paymentRequest.invoice_url = "";

  return new Promise((resolve, reject) => {
    const ref = admin.database().ref("requests-test");
    const key = ref.push().key;

    paymentRequest.id = key;

    ref
      .child(key)
      .update(paymentRequest)
      .then((snapshot) => {
        return resolve(snapshot);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
