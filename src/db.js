
const { MongoClient } = require('mongodb');
let connection_string= 'mongodb+srv://alkoshop:admin@cluster0.iclwo.mongodb.net/?retryWrites=true&w=majority'

let client = new MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = null

export default () => {
    return new Promise((resolve, reject) =>{

        if (db){
            resolve(db)
        }
        client.connect(err => {
            if(err){
                reject("Error: " + err)
            }
            else{
                console.log("Sucess")
                db = client.db("AlkoShop")
                resolve(db)
            }
        })
    })
}