const express= require("express"); 
const mongoose= require("mongoose");
const cors= require("cors");
require("dotenv").config(); 
const rutas= require("./src/routes/rutas");

const app= express(); 
const port = process.env.PORT || 4200; 

app.use(cors({
    origin: '*'
}));

app.use(express.json()); 
app.use("/", rutas); 

mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("Conexion a base de datos exitosa!"))
    .catch((err) => console.log(err)); 


app.listen(port, ()=>{
    console.log("Servidor corriendo en el puerto: " ,port);
})
