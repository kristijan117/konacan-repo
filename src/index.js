let express = require('express');
let connect = require('./db.js');
let cors = require('cors');
let mongo = require ('mongodb');
let auth = require('./auth.js');
let jwt = require('jsonwebtoken');

let dotenv = require("dotenv");
dotenv.config()
//import { createRequire } from "module";
//const require = createRequire(import.meta.url);


let Cart = require ('./cartLogic.js');

const app = express() 
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(__dirname + '/../public/'));
}
const port = 3007 || process.env.PORT  
app.use(express.json());

  var corsOptions = {
    credentials: true
  }
app.use(cors((corsOptions)));

app.set("trust proxy", 1)


/* --------- Autentifikacija --------- */

app.post('/korisnici', async (req, res) => {
    let UserData = req.body;

    let id;

    try {
        id = await auth.registerUser(UserData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }

    res.json({ id:id });
});

app.get('/korisnici', async (req,res) => {
    let db = await connect()
    
    let cursor = await db.collection("korisnik").find({})
    let finalData = await cursor.toArray();
    
    res.json(finalData);
});

app.get('/secret', [auth.verify], (req, res) => {
    res.json({ message: 'Tajna ruta, vaš email: ' + req.jwt.Email });
});

app.post('/auth', async (req, res) => {
    let user = await req.body;
    try {
        let finalData = await auth.authenticateUser(user.Email, user.Lozinka);
        res.json(finalData);
    }
    catch(e) {
        res.status(401).json({ error: e.message })
    }
});

/* --------- Proizvodi --------- */

app.post ('/proizvodi', async (req , res) => {
    let db = await connect();
    let  proizvodi = req.body;

    let result = await db.collection('proizvodi').insertOne(proizvodi);
    if (result.insertedCount == 1) {
        res.send({
            status: 'success',
            id: result.insertedId,
        });
    } 
    else {
        res.send({
            status: 'fail',
        });
    }
    
    console.log(result);
});

app.get('/proizvodi', async (req , res) => {
    let db = await connect();
    let query = req.query;
    let selektiraj = {}
    
    if(query.naziv){
        selektiraj.naziv = new RegExp(query.naziv)
        console.log(query.naziv)
    }

    if(query._any) {
        
        let pretraga = query._any;
        let pojmovi = pretraga.split(' ');
        selektiraj = {
            $and: [],
        };
    
        pojmovi.forEach((pojam) => {
            selektiraj.$and.push({naziv: new RegExp(pojam)});
        });
    }
    
    let pojam = query._any
    console.log(typeof(query._any),query._any)
    let cursor = await db.collection('proizvodi').find({naziv:{$regex: `${pojam}` ,$options: "i"}},selektiraj);
    let results = await cursor.toArray();

    res.json(results)
    
   
});

app.get('/svi_proizvodi', async (req , res) => {
    let db = await connect();
    let cursor = await db.collection('proizvodi').find({})
    let products = await cursor.toArray();

    console.log(products)
    res.json(products)
});


app.get('/proizvodi/:naziv', async (req , res) => {
    let nazivProizvoda = req.params.naziv;
    let db = await connect();
    let singleDoc = await db.collection('proizvodi').findOne({naziv: nazivProizvoda})

    console.log(singleDoc)
    res.json(singleDoc)
});

app.get('/proizvodi/kategorija/:vrste', async (req , res) => {
    let vrsteProizvoda = req.params.vrste;
    let db = await connect();

    console.log("Vrste: ",vrsteProizvoda)
    let singleDoc = await db.collection('proizvodi').find({vrste: vrsteProizvoda})
    let results = await singleDoc.toArray();
    
   
    res.json(results)
});

app.get('/proizvodi/brisi/:naziv', async (req , res) => {
    let nazivProizvoda = req.params.naziv;
    let db = await connect();

    let result = await db.collection('proizvodi').deleteOne({ naziv: nazivProizvoda });

	if (result && result.deletedCount == 1) {
		res.json(result);
	} else {
		res.json({
			status: "fail",
		});
	}
   
    res.json(result)
});
/* --------- Košarica --------- */

app.post("/dodaj_u_kosaricu/:naziv", async (req, res) => {

    let db = await connect();
    let cursor = await db.collection("proizvodi").find({})
    let finalData = await cursor.toArray();

    const naziv = req.params.naziv;

    const jednoPice = await finalData.find((proizvod) => proizvod.naziv === naziv);
    
    const cart = new Cart(jwt.cart ?? {}); 
    
    cart.dodajPice(jednoPice);
    jwt.cart = JSON.parse(JSON.stringify(cart));
    //console.log(cart);


    res.send(cart);
});  

app.get("/dohvati_kosaricu",async (req, res) => {
    let trenutnaKosarica = jwt;
    console.log(trenutnaKosarica.cart)
    res.json(trenutnaKosarica);
});

/* --------- Plaćanje --------- */

app.post("/placanje",async (req, res) => {
    let db = await connect();
    let payment = req.body;

    let result = await db.collection('placanje').insertOne(payment);
    if (result.insertedCount == 1) {
        res.send({
            status: 'success',
            id: result.insertedId,
        });
    } 
    else {
        res.send({
            status: 'fail',
        });
    }
    
});


app.listen(port, () => console.log(`Slušam na portu ${port}!`))