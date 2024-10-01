// // firebase.ts (Create a new file for Firebase interactions)
// import firebase from 'firebase/app';
// import 'firebase/database';

// // Initialize Firebase (Use your Firebase project's configuration)
// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY',
//   authDomain: 'YOUR_AUTH_DOMAIN',
//   databaseURL: 'YOUR_DATABASE_URL',
//   // ... other config
// };

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

// export const getProjectsOnce = async (filter?: string) => {
//   const snapshot = await firebase.database().ref('projects').orderByChild('name').once('value');
//   let projects = Object.values(snapshot.val() || {});

//   if (filter) {
//     projects = projects.filter((project: any) =>
//       project.name.toUpperCase().includes(filter.toUpperCase())
//     );
//   }

//   return projects;
// };
