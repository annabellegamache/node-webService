
/*dépendance*/
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const auth = require('basic-auth');
const app = express();
const mongo = require("mongodb");
const mongoclient = mongo.MongoClient;

app.use(cors());
app.use(bodyParser.json());


/*Autorisation*/
function authBasic(req, res, next){

    const usager = auth(req);

    if(usager && usager.name == 'biero' && usager.pass == 'biero'){
        next();
    }
    else{
        res.status(401).send("401");
    }
}

/*Toutes les routes*/
app.all("*", function(req, res, next){
 //code
})

/* route nécessitant une autorisation*/
app.put("*", authBasic);
app.post("*", authBasic);
app.delete("*", authBasic);

/* route ajout bière */
app.put("/biere", function(req, res){ 
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        let database = db.db("biero");
        let collection = database.collection("bieres");
        let uneBiere = req.body;
        uneBiere.date_ajout = new Date();
        uneBiere.date_modif = '';
        uneBiere.commentaires = [];
        collection.insertOne(uneBiere, (err, db)=>{
            res.json({ok : true});        
        })

    })
    //res.json(req.body);
})

/*route get bieres*/
app.get("/biere", function(req, res){
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        let database = db.db("biero");
        let collection = database.collection("bieres");
        collection.find().toArray((err, resultat)=>{
            resultat.forEach(element => {
               // delete element.commentaires;
            });
            res.json(resultat);
        })

    })
    //res.send(chaine + "liste des bieres");
});

/*route get une biere*/
app.get("/biere/:id_biere", function(req, res, next){
    //res.send(chaine + "Les dÃ©tails d'une biere" + req.params.id_biere);
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        let database = db.db("biero");
        let collection = database.collection("bieres");
        collection.findOne({_id : new mongo.ObjectId(req.params.id_biere)}, (err, resultat)=>{
            delete resultat.commentaires;
            res.json(resultat);
        });

    })
});


/* route put commentaire */
app.put("/biere/:id_biere/commentaire", function(req, res){ 
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        let database = db.db("biero");
        let collection = database.collection("bieres");
       
        commentaires = req.body;
        //ne fonctionne pas...
        collection.findOneAndUpdate({_id : new mongo.ObjectId(req.params.id_biere)}, 
                                    {$push: {"commentaires" : commentaires}});
    })
    res.json(req.params.id_biere);
});

/* route delete bière */
app.delete("/biere/:id_biere", function(req, res){ 
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        id = req.params.id_biere;
        let database = db.db("biero");
        let collection = database.collection("bieres");
        collection.deleteOne({ _id: new mongo.ObjectId(id) }, (err, resultat)=>{
            res.json(resultat);
        });

    })
})

/*route get commentaires d'une biere*/
app.get("/biere/:id_biere/commentaire", function(req, res, next){
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        let database = db.db("biero");
        let collection = database.collection("bieres");
        
        collection.findOne({_id : new mongo.ObjectId(req.params.id_biere)}, (err, resultat)=>{
            res.json(resultat.commentaires);
        });
        


    })
});


/* route post bière */
app.post("/biere/:id_biere", function(req, res){ 
    mongoclient.connect("mongodb://127.0.0.1:27017", (err, db)=>{
        if(err){
            res.send("Erreur de connection");
            throw err;
        }
        id = req.params.id_biere;
        let database = db.db("biero");
        let collection = database.collection("bieres");
        let biereUpdate = req.body;
        let newValues = {$set : {   nom :biereUpdate.nom,
                                    brasserie :biereUpdate.brasserie,
                                    description :biereUpdate.description,
                                    image :biereUpdate.image
                                 }
                            };
        
        collection.updateOne({_id : new mongo.ObjectId(req.params.id_biere)}, newValues, (err, resultat)=>{
                res.json(resultat);
                        });
        

    })
    
})

app.listen('8080', function(req, res){
    console.log("Serveur démarré");
})