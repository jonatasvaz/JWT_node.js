require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const app=express()
const cors= require('cors')
const bodyparser=require('body-parser')
mongoose.set('strictQuery', true)




const User = require('./model/index')
const { find } = require('./model/index')

app.use(express.json())
app.use(cors())
app.use(bodyparser.json())

app.get('/',async (req,res)=>{
  const dados = await User.find()
   
    res.status(200).json(dados)
})
 

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // check if user exists
  const user = await User.findById(id,"-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  res.status(200).json({ user });
});


function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Acesso negado!" });

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, 'bb2ub4iuh67u9y4gufn');

    next();
  } catch (err) {
    res.status(400).json({ msg: "O Token é inválido!" });
  }
}
 
app.post('/auth/register', async (req,res)=>{  

    const {name,email,password,confirmpassword}=req.body

     if(!name || !email || !password || !confirmpassword){
        res.status(422).json({msg:"prencha todos os campos"})
        }
     if(password !=confirmpassword){
        res.status(422).json({msg:"senhas diferentes"}) 
     }
     const userExists = await User.findOne({ email: email });

     if (userExists) {
       return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
     }

      
   console.log()
     const salt = await bcrypt.genSalt(12);
    // console.log('salt ' +salt)
  const passwordHash = await bcrypt.hash(password, salt);
  //console.log('password', +passwordHash)

 const user = new User({ 
    name,
    email,
    password:passwordHash 
  });  
   
  try {     
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }

}) 

app.post('/auth/login', async (req,res)=>{
    const{email,password}=req.body

    if(!email){
      return   res.status(422).json({msg:"email vazio"})
    }
    if(!password){
      return  res.status(422).json({msg:"senha vazia"})
    }
    const user= await  User.findOne({email:email})

    if(!user){
      return  res.status(404).json({msg:"email nãi encontrado"})
    }
    const  authPassword= await bcrypt.compare(password,user.password)

    if(!authPassword){ 
        return      res.status(422).json({msg:"senha invalida"})
    }
     
       // const secret= process.env.secret
      
    
      try {
       // const secret = process.env.SECRET;
    
        const token = jwt.sign(
          {
            id: user._id,         
          },
          'bb2ub4iuh67u9y4gufn'   
        );
            console.log(token) 
        res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
      } catch (error) { 
        res.status(500).json({ msg: error });
      }      
})     
  
 const dbUser= process.env.DB_USER
 const dbPassword= process.env.DB_PASSWORD

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.t8i0ty2.mongodb.net/?retryWrites=true&w=majority`)
.then(()=>{
    app.listen(3001,()=>console.log('servidor rodando'))
    console.log('conectou ao banco de dados')
})
.catch(err=>console.log('erro ao conectar ao banco de dados ' + err ))

   
   
    
// USERNAME: JONATAS
//PASSWORD: rbTQRWgbeDHKN7Lz
  
   