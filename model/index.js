const mongoose=require('mongoose')

const user=mongoose.model('jwt',{
    name:String,
    email:String,
    password:String,

})

module.exports=user 