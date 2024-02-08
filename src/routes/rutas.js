const express= require("express"); 
const { Cliente, Reservacion, Habitacion }= require("../models/esquema")
const ruta= express.Router(); 
const cron = require("node-cron")


// const changeDate = (data) => {
//     return new Promise((res, rej)=>{
//         try{
//             const reservations = data.filter((reservacion) => reservacion.fecha_hora <= new Date());
//             const habitacionIds = reservations.map((reservacion) => reservacion.habitacion._id);
            
//             // $in: Es un operador de consulta que selecciona los documentos donde el valor de _id está contenido en el array habitacionIds.
//             const habitaciones = Habitacion.find({ _id: { $in: habitacionIds } });
            
//             cron.schedule('0 * * * *', async () => {
//                 habitaciones.forEach(async (habitacion) => {
//                     const reservationsForHabitacion = reservations.filter((reservacion) => reservacion.habitacion._id.toString() === habitacion._id.toString());
//                     if (reservationsForHabitacion.length > 0) {
//                         habitacion.disponible = true;
//                         await habitacion.save();
//                     }
//                 });
//             }, { scheduled: false });
            
//             cron.schedule('0 * * * *').start();
//             res();
//         }catch(err){
//             rej(err)
//         }
//     })
//   }
const changeDate = async (data) => {
    try {
      const reservations = data.filter((reservacion) => reservacion.fecha_hora <= new Date());
      const habitacionIds = reservations.map((reservacion) => reservacion.habitacion._id);
    
      const habitaciones = await Habitacion.find({ _id: { $in: habitacionIds } });
    
      for (const habitacion of habitaciones) {
        const reservationsForHabitacion = reservations.filter(
          (reservacion) => reservacion.habitacion._id.toString() === habitacion._id.toString()
        );
        if (reservationsForHabitacion.length > 0) {
          habitacion.disponible = true;
          await habitacion.save();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const scheduleChangeDate = () => {
    cron.schedule('0 * * * *', () => {
      Reservacion.find()
        .then((data) => changeDate(data))
        .catch((err) => console.error(err));
    }).start();
  };
  
  scheduleChangeDate();


ruta.get("/lista-habitaciones", (req, res)=>{
    Habitacion
        .find()
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json({message: err})})
}); 

ruta.get("/lista-habitaciones-dispon", (req, res)=>{
    Habitacion
        .find({disponible: true})
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json({message: err})})
}); 

ruta.get("/lista-reservaciones", (req, res)=>{
    // let datos
    Reservacion
    .find()
    .then((data) => {
        // datos=data
        res.json(data)
        // return datos
    }
    )
    .catch((err) => res.json({ message: err }))
    // .then((datos) => {
    //   // Se actualizan las fechas después de enviar la respuesta al cliente
    //   if(datos){
    //       return changeDate(datos);
    //   }
    // })
    // .catch((err) => console.error(err));
    ;
}); 

ruta.get("/lista-clientes", (req, res)=>{
    Cliente
        .find()
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json({message: err})})
}); 

ruta.get("/lista-reservaciones-vig", (req, res)=>{
    Reservacion
        .find({estado: "Vigente"})
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json({message: err})})
}); 

ruta.get("/lista-reservaciones-can", (req, res)=>{
    Reservacion
        .find({estado: "Cancelada"})
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json({message: err})})
}); 

ruta.post("/crear-habitacion", (req,res)=>{
    const habitacion= Habitacion(req.body);
       habitacion.save()
            .then((data)=>{ 
                res.json(data)
            })
            .catch((err)=>{ res.json({message: err})})
}); 

ruta.post("/crear-reservacion", async (req,res)=>{
    // try {
    //     const num_habitacion = req.body.habitacion;
    //     const fecha_hora= req.body.fecha_hora
    //     let listReservaciones
        
    //     await Reservacion
    //         .find({habitacion: num_habitacion, estado: "Vigente"})
    //         .then((data) => {
    //             listReservaciones=data
    //             res.json(data)
    //             return listReservaciones
    //         })

    //         .then((listReservaciones)=>{
    //             if(listReservaciones){
    //                 listReservaciones.forEach(async (reservacion)=>{
    //                     if(reservacion.fecha_hora < fecha_hora){
    //                         const reserva = new Reservacion(req.body);
                            
    //                         await reserva.save();
                            
    //                         await Habitacion.findOneAndUpdate(
    //                             { numero_habitacion: num_habitacion },
    //                             { $set: { disponible: false } }
    //                             );
                                
    //                             res.json(reserva);
    //                         }else{
    //                             res.status(400).json({ error: "La habitación no está disponible en la fecha especificada." });
    //                         }
    //                     })
    //                 }
    //         })  
        
    //   } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: "Error interno del servidor" });
    //   }
    try {
        const num_habitacion = req.body.habitacion;
        const fecha_hora = new Date(req.body.fecha_hora);

        // Consultar reservaciones vigentes para la habitación
        const listReservaciones = await Reservacion.find({ habitacion: num_habitacion, estado: "Vigente" });

        if (listReservaciones.length > 0) {
            // Verificar disponibilidad de la habitación para la nueva reserva
            const isAvailable = listReservaciones.every((reservacion) => reservacion.fecha_hora < fecha_hora);

            if (isAvailable) {
                // Crear nueva reserva
                const reserva = new Reservacion(req.body);
                await reserva.save();

                // Actualizar disponibilidad de la habitación
                await Habitacion.findOneAndUpdate(
                    { numero_habitacion: num_habitacion },
                    { $set: { disponible: false } }
                );

                res.json(reserva);
            } else {
                res.status(400).json({ error: "La habitación no está disponible en la fecha especificada." });
            }
        } else {
            // Si no hay reservaciones vigentes, crear la reserva sin verificar disponibilidad
            const reserva = new Reservacion(req.body);
            await reserva.save();
            res.json(reserva);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error interno del servidor" });
    }

})

ruta.post("/crear-cliente", (req,res)=>{
    const cliente= Cliente(req.body);
       cliente.save()
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json({message: err})})
})

ruta.put("/actualizar-cliente/:documento", (req, res)=>{
    const {nombre, telefono}= req.body; 
    const {documento}= req.params; 
    const documentoParseado = parseInt(documento);

        if (isNaN(documentoParseado)) {
            return res.status(400).json({ error: "El número de documento debe ser un valor numérico." });
        }else{
            Cliente
            .findOneAndUpdate({documento: documentoParseado}, {$set: {nombre, telefono}})
            .then((data)=>{ res.json(data)})
            .catch((err)=>{ res.json(err)})
        }
})

// actualizar 
ruta.put("/actualizar-habitacion/:numero_habitacion", (req, res)=>{
    const {precio, tamaño, disponible}= req.body; 
    const {numero_habitacion}= req.params; 
     Habitacion
        .findOneAndUpdate({numero_habitacion:numero_habitacion}, {$set: {precio, tamaño, disponible}})
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json(err)})
})


// eliminar

ruta.delete("/eliminar-habitacion/:numero_habitacion", (req,res)=>{
    const {numero_habitacion}= req.params; 
     Habitacion
        .deleteOne({numero_habitacion: numero_habitacion})
        .then((data)=>{ res.json(data)})
        .catch((err)=>{ res.json(err)})
})


module.exports= ruta;