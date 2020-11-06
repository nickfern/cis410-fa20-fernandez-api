const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('./dbConnectExec.js')

const app = express();
app.use(express.json())

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

app.post("/contacts", async (req,res)=>{
    //res.send("creating user")
    //console.log("request body", req.body)

    var nameFirst = req.body.nameFirst;
    var nameLast = req.body.nameLast;
    var email = req.body.email;
    var password = req.body.password;

    if(!nameFirst || !nameLast || !email || !password){
        return res.status(400).send("bad request")
    }

    nameFirst = nameFirst.replace("'","''")
    nameLast = nameLast.replace("'","''")

    var emailCheckQuery = `SELECT email
    from contact 
    where email = '${email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    var hashedPassword = bcrypt.hashSync(password)
    //console.log("existing user", existingUser)
    if(existingUser[0]){
        return res.status(409).send('Please enter a different email.')
    }

    var insertQuery = `insert into contact(NameFirst,NameLast,Email,Password)
    values('${nameFirst}','${nameLast}','${email}','${hashedPassword}')`

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send()})
    .catch((err)=>{
        console.log("error in POST /contacts",err)
        res.status(500).send()
    })
})

app.get("/movies",(req,res)=>{
    //get data from database
    db.executeQuery(`SELECT * FROM movie
     LEFT JOIN genre
     ON genre.GenrePK = movie.GenreFK`)
     .then((result)=>{
         res.status(200).send(result)
     })
     .catch((err)=>{
         console.log(err);
         res.status(500).send()
     })
})
app.get("/movies/:pk", (req,res)=>{
    var pk = req.params.pk
    console.log("my PK:" , pk)

    var myQuery = `select *
    from movie
    left join genre
    on genre.GenrePK = movie.GenreFK
    Where moviePK = ${pk}`

    db.executeQuery(myQuery)
        .then((movies)=>{
            //console.log("Movies: ",movies)
            if(movies[0]){
                res.send(movies[0])
            }else{res.status(404).send('bad request')}
        })
        .catch((err)=>{
            console.log("Error in /movies/pk", err)
            res.status(500).send()
        })
})
app.listen(5000,()=>{console.log("app is running on port 5000")})