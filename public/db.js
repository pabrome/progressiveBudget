import { openDB } from 'https://unpkg.com/idb?module';

// initialize database
let db;

( async ()=>{
  // try {
    db = await openDB("budget", 1, {
      upgrade(db) {
        const objectStore = db.createObjectStore("pending", {
          keyPath: "offlineId",
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true 
          });

        console.log( `~ created the db/upgraded it:`, objectStore.name );
      } });

  // } catch( err ){
  //   console.log( `x problems creating database, failed.` );
  // }

})();


console.log( `defining saveRecord & syncTransactionsToServer`, db );

async function saveOfflineRecord( newTrans ) {
  const trans = db.transaction("pending", "readwrite");
  const pendingTable = trans.objectStore("pending");    
  pendingTable.add( newTrans );
  // wait for this trans to complete
  await trans.done;

  console.log( `+ api down, saving offline: `+JSON.stringify(newTrans) );
}

async function syncOfflineToServer() {
  // check if any pending transactions
  // if yes: get them + /api/transaction/bulk call

  const pendingList = await db.getAll("pending");
  console.log( `pendingList: `, pendingList );

  if( pendingList.length ){
    // sync it to server
    const response = await fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(pendingList),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    });
    // tne response is actually a promise so we 'await' it too.
    const responseData = await response.json();

    console.log( `items accepted and sync'd by server:`, responseData.offlineIds );
    // now in theory the server will verify it saved each of these posts,
    
    // if successful delete from indexDb
    for( let id of responseData.offlineIds ){
      // delete entry
      console.log( `.. deleting pending transaction (sync ok): id=${id}`, id );
      await db.delete("pending", id );
    }
  }
}


function browserOnline(){
  console.log( `.. browser back online!` );
  syncOfflineToServer();
}

function browserOffline(){
  console.log( `.. browser OFFLINE!` );
}

window.addEventListener("online", browserOnline );
window.addEventListener("offline", browserOffline );

export default saveOfflineRecord;
