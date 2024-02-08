const mongoose= require("mongoose");

const clienteSchema= mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    telefono: {
        type: String, 
        required: true
    },
    documento: {
        type: Number, 
        required: true
    }
});

const habitacionSchema= mongoose.Schema({
    precio:{
        type: Number,
        required: true
    },
    tamaño: {
        type: String, 
        required: true
    },
    numero_habitacion:{
        type: Number,
        required: true 
    },
    disponible:{
        type: Boolean,
        required: true,
        // true es disponible 
        default: true  
    }
});

const reservacionSchema= mongoose.Schema({
    fecha_hora:{
        type: Date,
        required: true
    },
    cliente: {
        type: Number,
        ref: 'Cliente',
        required: true
    },
    habitacion: {
        type: Number,
        ref: 'Habitacion',
        required: true
    },
    estado:{
        type: String,
        required: true 
    }
});



const Cliente= mongoose.model("cliente", clienteSchema);
const Reservacion= mongoose.model("reservacion", reservacionSchema);
const Habitacion= mongoose.model("habitacion", habitacionSchema);

module.exports= {
    Cliente, 
    Reservacion,
    Habitacion 
}