import mongo from 'mongodb';
import connect from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

(async () => {
    let db = await connect();
    await db.collection('korisnik').createIndex({ Email: 1 }, { unique: true });
})();

export default {
    async registerUser(user) {
        let db = await connect();

        let doc = {
            Ime_i_prezime: user.Ime_i_prezime,
            Email: user.Email,
            Lozinka: await bcrypt.hash(user.Lozinka, 8),
        }
        try{
            let result = await db.collection('korisnik').insertOne(doc);
            if (result && result.insertedId){
                return result.insertedId;
            }
        } catch(e){
            if(e.name == 'MongoError' || e.code == 11000) {
                throw new Error('Korisnik već postoji');
            }
        }
    },

    async authenticateUser(Email, Lozinka) {
        let db = await connect();
        let userData = await db.collection('korisnik').findOne({ Email: Email })
        
        if (userData && userData.Lozinka && (await bcrypt.compare(Lozinka, userData.Lozinka))){
            delete userData.Lozinka
            let token = jwt.sign(userData, process.env.JWT_SECRET, {
                algorithm: 'HS512',
                expiresIn: '2 weeks'
            })
            
            return {
                token,
                Email: userData.Email
            }

        }
        else {
            throw new Error('Cannot authenticate')
        }
    },
    async verify(req, res, next) {
        try {
            let authorization = await req.headers.authorization.split(' ');
            let type = authorization[0];
            let token = authorization[1];
            if (type !== 'Bearer') {
                return res.status(401).send();
            }
            else{
                req.jwt = jwt.verify(token, process.env.JWT_SECRET);
                
                return next();
            }
        }
        catch (e) {
            return res.status(401).send();
        }
    }

}