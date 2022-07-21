// adding new chat documents
// setting up a real-time listener to get new chats
// updating the username
// updating the room

class Chatroom {
    constructor(room, username) {
        this.room = room;
        this.username = username;
        this.chats = db.collection('chats');
        this.unsub;
    }
    async addChat(message){
        // format a chat object
        const now = new Date();
        const chat = {
            message,
            username: this.username,
            room: this.room,
            created_at: firebase.firestore.Timestamp.fromDate(now)
        };
        // save the chat document
        // 'this' references the message we just created
        // chats is the reference the 'chats' collection in firestore
        // add is being used to add to the database (since we are using 'this', it is the same as doing 
        // db.collection('chats').add(chat))
        // chat is the object we just created
        const response = await this.chats.add(chat);
        return response;
    }
    // we are not adding the 'async' key word in the beginning because this is not going to be an asynchronis function
    // we are NOT going to ask for the chats once and then wait for those. We are instead going to set up a real time listener, which will return a response everytime there is a change
    // we want to get the document changes on each snapshot. To do this, we will use snapshot.docChanges()
    // we then want to cycle through this array and do something with each change
    // to do this, we will use a forEach to pass in each change as a parameter for the fuction for each item in that change's array
    getChats(callback){
        // the this.chats returns a function, which is the unsubscribe function
        this.unsub = this.chats
            // where is a method that allows us to get documents where a certain condition is true
            // where takes 3 targets. 
            // The first target is the property name we want to assess. In our example, thats the property called 'room'
            // The second property is '==' to show it is equal to something
            // The third property is the second property we want to asses. Here, it is checking what room is equal to.
            .where('room', '==', this.room)
            // This lets you organize by whatever you want. This could be time and date, alphabetically, etc.
            .orderBy('created_at')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        // update ui
                        // callback will invoke the getChats method everytime a change is added, and if change.type === 'added'
                        // callback is a function passed as an argument to another function
                        // this lets a function call another function
                        // a callback function can run after another function has finished
                        // we are passing change.doc.data() as an argument for the other function to use
                        callback(change.doc.data());
                    }
                });
            });
    }
    updateName(username){
        this.username = username;
    }
    updateRoom(room){
        this.room = room;
        console.log('room updated');
        if(this.unsub){
            this.unsub();
        }
    }
}

const chatroom = new Chatroom('gaming', 'shaun');

// this returns a promise, which lets us add the .then method, as well as the .catch method, which catches any errors
// chatroom.addChat('hello everyone ;)')
//     .then(() => console.log('chat added'))
//     .catch(err => console.log(err));

// this function calls the getChats method, which is found in the Chatroom class
chatroom.getChats((data) => {
    console.log(data);
});

// setTimeout(() => {
//     chatroom.updateRoom('gaming');
//     chatroom.updateName('yoshi');
//     chatroom.getChats((data) => {
//         console.log(data);
//     });
//     chatroom.addChat('hello');
// }, 3000);