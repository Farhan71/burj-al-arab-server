const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbxy9.mongodb.net/burjdb?retryWrites=true&w=majority`;
const port = 5000

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

 



var serviceAccount = require("./configs/burj-al-arab-bba98-firebase-adminsdk-hksbg-b8cefd4897.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});





const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {
  res.send('Hello World!')
})



client.connect(err => {
  const bookings = client.db("burjdb").collection("dates");
  // perform actions on the collection object
  app.post('/addBooking', (req, res) => {
      const newBooking = req.body
      bookings.insertOne(newBooking)
      .then(result => {
        //   console.log(result)
        res.send(result.insertedCount > 0)
      })
      console.log(newBooking)
  })

  app.get('/bookings', (req, res)=>{
      const bearer = req.headers.authorization
      console.log(bearer)
      if( bearer && bearer.startsWith('Bearer ')){
          const idToken = bearer.split(' ')[1]
          console.log({idToken})
      

      // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        if(tokenEmail === req.query.email){
            bookings.find({email: req.query.email})
            .toArray((err, documents) => {
            res.status(200).send(documents)
            })
        }
        else {
            res.status(401).send("unauthorized access")
        }
        // console.log(uid)
        // ...
        })
        .catch((error) => {
            res.status(401).send("unauthorized access")
        });
    }
    else {
        res.status(401).send("unauthorized access")
    }
      
  })



  console.log("database connected")
//   client.close();
});


app.listen(port)